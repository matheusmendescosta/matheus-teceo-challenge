import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Customer from '../customers/customers.model';
import { OrderStatus } from './enums/order-status.enum';
import OrderItem from '../order-items/order-items.model';

@Entity('orders')
export default class Order extends BaseModel {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @Column({ name: 'total', type: 'numeric' })
  total: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status: OrderStatus;
}
