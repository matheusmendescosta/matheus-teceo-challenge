import { SelectQueryBuilder } from 'typeorm';
import BaseFilter from '../../../../commons/filters/base.filter';
import Color from '../colors.model';
import { IsOptional, IsString } from 'class-validator';

export default class ListColorsFilter extends BaseFilter<Color> {
  @IsOptional()
  @IsString()
  name?: string;

  createWhere(queryBuilder: SelectQueryBuilder<Color>, alias: string): void {
    if (this.name) {
      queryBuilder.andWhere(`${alias}.name ILIKE :name`, {
        name: `%${this.name}%`,
      });
    }
  }
}
