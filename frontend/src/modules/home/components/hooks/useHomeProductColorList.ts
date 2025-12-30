import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useApplicationContext } from '../../../global/contexts/ApplicationContext';
import type { ProductColorDTO } from '../../interfaces/product-color.dto';
import homeRepository from '../../repositories/home.repository';

const useHomeProductColorList = () => {
  const { search, handleLoadingStatus } = useApplicationContext();

  const queryFn = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      return handleLoadingStatus<ProductColorDTO[]>({
        disabled: !search?.length,
        requestFn: async () => {
          const response = await homeRepository().getProductColors(pageParam, search);
          return response.data.data;
        },
      });
    },
    [search, handleLoadingStatus]
  );

  const getNextPageParam = useCallback((lastPage: ProductColorDTO[], pages: ProductColorDTO[][]) => {
    if (!lastPage.length) {
      return undefined;
    }

    return pages.length;
  }, []);

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['product-colors', search],
    queryFn,
    getNextPageParam,
    initialPageParam: 0,
  });

  return infiniteQuery;
};

export default useHomeProductColorList;
