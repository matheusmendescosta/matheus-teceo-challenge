import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Order from '../orders/orders.model';
import Sku from '../skus/skus.model';

@Entity('order_items')
@Index(['order_id'])
@Index(['sku_id'])
@Index(['order_id', 'sku_id'])
export default class OrderItem extends BaseModel {
  @ManyToOne(() => Sku)
  @JoinColumn({ name: 'sku_id' })
  sku: Sku;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', type: 'uuid' })
  order_id: string;

  @Column({ name: 'sku_id', type: 'uuid' })
  sku_id: string;

  @Column({ name: 'quantity', type: 'numeric' })
  quantity: number;
}
