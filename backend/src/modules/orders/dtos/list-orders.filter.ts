import { IsOptional, IsString } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm';
import BaseFilter from '../../../../commons/filters/base.filter';
import Order from '../orders.model';

export default class ListOrdersFilter extends BaseFilter<Order> {
  @IsOptional()
  @IsString()
  customerNameOrEmail?: string;

  createWhere(queryBuilder: SelectQueryBuilder<Order>, alias: string): void {
    if (this.customerNameOrEmail) {
      queryBuilder.andWhere(
        `${alias}.customer.name ILIKE :customerNameOrEmail OR ${alias}.customer.email ILIKE :customerNameOrEmail`,
        { customerNameOrEmail: `%${this.customerNameOrEmail}%` },
      );
    }
  }
}
