import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Customer from '../customers/customers.model';
import { OrderStatus } from './enums/order-status.enum';
import OrderItem from '../order-items/order-items.model';

@Entity('orders')
@Index(['customer_id'])
@Index(['status'])
export default class Order extends BaseModel {
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id', type: 'uuid' })
  customer_id: string;

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
