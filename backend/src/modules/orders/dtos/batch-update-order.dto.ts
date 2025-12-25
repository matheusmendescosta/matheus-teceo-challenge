import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export default class BatchUpdateOrderDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  orderIds: string[];

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
