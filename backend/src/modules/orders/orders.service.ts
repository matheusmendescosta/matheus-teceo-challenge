import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CacheService } from '../../commons/cache/cache.service';
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
    private readonly cacheService: CacheService,
  ) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<Order> {
    return this.repository.createQueryBuilder(alias);
  }

  async list(filter: ListOrdersFilter): Promise<Page<ListOrdersDTO>> {
    // ===============================================
    // CACHE: Tentar buscar do Redis
    // ===============================================
    const cacheKey = this.cacheService.generateCacheKey('orders:list', {
      skip: filter.skip,
      limit: filter.limit,
      customerNameOrEmail: filter.customerNameOrEmail,
      status: filter.status,
    });

    const cached = await this.cacheService.get<Page<ListOrdersDTO>>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT:', cacheKey);
      return cached;
    }
    console.log('❌ Cache MISS:', cacheKey);

    // ===============================================
    // Query 1: Contar total (leve - sem items)
    // ===============================================
    const countQueryBuilder = this.createQueryBuilder('order').leftJoin(
      'order.customer', // ← USA ÍNDICE: idx_orders_customer_id
      'customer',
    );
    filter.createWhere(countQueryBuilder);
    const [, count] = await countQueryBuilder.getManyAndCount();

    // ===============================================
    // Query 2: Trazer orders paginados com customer
    // ===============================================
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer') // ← USA ÍNDICE: idx_orders_customer_id
      .orderBy('order.id', 'ASC');

    filter.createWhere(queryBuilder);
    filter.paginate(queryBuilder);

    const orders = await queryBuilder.getMany();
    const orderIds = orders.map((o) => o.id);

    // ===============================================
    // Query 3: Trazer items dos orders selecionados
    // ===============================================
    if (orderIds.length > 0) {
      const orderItems = await this.orderItemsService
        .createQueryBuilder('orderItem')
        .leftJoinAndSelect('orderItem.sku', 'sku') // ← USA ÍNDICE: idx_order_items_sku_id
        .leftJoinAndSelect('sku.productColor', 'productColor') // ← USA ÍNDICE: idx_skus_product_color_id
        .where('orderItem.order_id IN (:...orderIds)', { orderIds }) // ← USA ÍNDICE: idx_order_items_order_id
        .orderBy('orderItem.order_id', 'ASC')
        .addOrderBy('orderItem.id', 'ASC')
        .getMany();

      // Agrupar items por order (com tipagem correta)
      const itemsByOrderId = new Map<string, typeof orderItems>();
      orderItems.forEach((item) => {
        const orderId = item.order_id;
        if (!itemsByOrderId.has(orderId)) {
          itemsByOrderId.set(orderId, []);
        }
        itemsByOrderId.get(orderId)!.push(item);
      });

      // Associar items aos orders
      orders.forEach((order) => {
        order.orderItems = itemsByOrderId.get(order.id) || [];
      });
    } else {
      orders.forEach((order) => {
        order.orderItems = [];
      });
    }

    const ordersWithTotals = this.getOrdersWithTotals(orders);
    const result = Page.of(ordersWithTotals, count);

    // ===============================================
    // CACHE: Salvar resultado no Redis (5 minutos)
    // ===============================================
    await this.cacheService.set(cacheKey, result, 300);
    console.log('💾 Resultado salvo em cache');

    return result;
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
    // Invalidar cache de listas quando atualiza um order
    await this.cacheService.invalidatePattern('orders:list:*');
  }

  async create(order: Partial<Order>) {
    const newOrder = this.repository.create(order);
    const result = await this.repository.save(newOrder);
    // Invalidar cache de listas quando cria um novo order
    await this.cacheService.invalidatePattern('orders:list:*');
    return result;
  }

  async delete(orderId: string) {
    await this.repository.delete(orderId);
    // Invalidar cache de listas quando deleta um order
    await this.cacheService.invalidatePattern('orders:list:*');
  }

  async batchUpdate(orderIds: string[], order: Partial<Order>): Promise<void> {
    for (const orderId of orderIds) {
      await this.update(orderId, order);
    }
  }
}
