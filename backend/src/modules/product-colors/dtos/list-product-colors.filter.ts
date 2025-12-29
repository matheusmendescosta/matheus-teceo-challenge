import { IsOptional, IsString } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm';
import BaseFilter from '../../../../commons/filters/base.filter';
import ProductColor from '../product-colors.model';

export default class ListProductColorsFilter extends BaseFilter<ProductColor> {
  @IsOptional()
  @IsString()
  productCodeOrName?: string;

  createWhere(queryBuilder: SelectQueryBuilder<ProductColor>): void {
    if (this.productCodeOrName) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM products p WHERE p.id = productColor.product_id 
          AND (p.code ILIKE (:productCodeOrName) OR p.name ILIKE (:productCodeOrName))
        )`,
        { productCodeOrName: `%${this.productCodeOrName}%` },
      );
    }
  }
}
