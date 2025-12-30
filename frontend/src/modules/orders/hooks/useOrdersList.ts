import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useApplicationContext } from '../../global/contexts/ApplicationContext';
import type { OrderStatus } from '../enums/orderStatus.enum';
import type { OrderDTO } from '../interfaces/order.dto';
import ordersRepository from '../repositories/orders.repository';

const useOrdersList = () => {
  const queryClient = useQueryClient();

  const { search, handleLoadingStatus } = useApplicationContext();
  const queryKey = ['orders', search];

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const queryFn = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return handleLoadingStatus<OrderDTO[]>({
        disabled: !search?.length,
        requestFn: async () => {
          const response = await ordersRepository().getOrders(
            pageParam,
            search
          );
          return response.data.data;
        },
      });
    },
    [search, handleLoadingStatus]
  );

  const getNextPageParam = useCallback((lastPage: OrderDTO[], pages: OrderDTO[][]) => {
    if (!lastPage.length) {
      return undefined;
    }

    return pages.length;
  }, []);

  const onChangeStatus = useCallback(
    async (newStatus: OrderStatus, orderId: string) => {
      const isMassAction = selectedOrderIds.includes(orderId);

      const orderIds = isMassAction ? selectedOrderIds : [orderId];

      queryClient.setQueryData<{ pages: OrderDTO[][] }>(queryKey, oldData => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData?.pages?.map(page =>
            page.map(order =>
              orderIds.includes(order.id)
                ? { ...order, status: newStatus }
                : order
            )
          ),
        };
      });

      try {
        if (isMassAction) {
          await ordersRepository().updateBatchOrderStatus(
            selectedOrderIds,
            newStatus
          );
        } else {
          await ordersRepository().updateOrderStatus(orderId, newStatus);
        }
      } catch (err) {
        queryClient.invalidateQueries({ queryKey });
        console.error('Failed to update order status:', err);
      }

      setSelectedOrderIds([]);
    },
    [selectedOrderIds, queryKey, queryClient]
  );

  const toggleOrderId = useCallback((orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    initialPageParam: 0,
  });

  return { ...infiniteQuery, onChangeStatus, toggleOrderId, selectedOrderIds };
};

export default useOrdersList;
