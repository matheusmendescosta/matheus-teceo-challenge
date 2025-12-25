import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import OrderItemsService from '../order-items/order-items.service';
import { ListOrdersDTO } from './dtos/list-orders.dto';
import ListOrdersFilter from './dtos/list-orders.filter';
import Order from './orders.model';

@Injectable()
export default class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,

    private readonly orderItemsService: OrderItemsService,
  ) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<Order> {
    return this.repository.createQueryBuilder(alias);
  }

  async list(filter: ListOrdersFilter): Promise<Page<ListOrdersDTO>> {
    const countQueryBuilder = this.createQueryBuilder('order').leftJoin(
      'order.customer',
      'customer',
    );

    filter.createWhere(countQueryBuilder, 'order');

    const [, count] = await countQueryBuilder.getManyAndCount();

    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.sku', 'sku')
      .leftJoinAndSelect('sku.productColor', 'productColor')
      .orderBy('order.id', 'ASC');

    filter.createWhere(queryBuilder, 'order');
    filter.paginate(queryBuilder);

    const orders = await queryBuilder.getMany();
    const ordersWithTotals = this.getOrdersWithTotals(orders);

    return Page.of(ordersWithTotals, count);
  }

  private getOrdersWithTotals(orders: Order[]): ListOrdersDTO[] {
    return orders.map((order) => {
      let totalValue = 0;
      let totalQuantity = 0;
      const uniqueProductColors = new Set<string>();

      order.orderItems.forEach((orderItem) => {
        totalValue += orderItem.sku.price * orderItem.quantity;
        totalQuantity += Number(orderItem.quantity);
        uniqueProductColors.add(orderItem.sku.productColor.id);
      });

      const totalProductColors = uniqueProductColors.size;
      const averageValuePerUnit = totalQuantity
        ? parseFloat((totalValue / totalQuantity).toFixed(2))
        : 0;
      const averageValuePerProductColor = totalProductColors
        ? parseFloat((totalValue / totalProductColors).toFixed(2))
        : 0;

      return {
        id: order.id,
        status: order.status,
        customer: order.customer,
        totalValue,
        totalQuantity,
        totalProductColors,
        averageValuePerUnit,
        averageValuePerProductColor,
      };
    });
  }

  async update(orderId: string, order: Partial<Order>) {
    await this.repository.update(orderId, order);
  }

  async batchUpdate(orderIds: string[], order: Partial<Order>): Promise<void> {
    for (const orderId of orderIds) {
      await this.update(orderId, order);
    }
  }
}
