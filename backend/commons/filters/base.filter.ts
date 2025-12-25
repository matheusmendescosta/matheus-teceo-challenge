import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export default abstract class BaseFilter<T extends ObjectLiteral> {
  constructor(data?: Partial<BaseFilter<T>>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  abstract createWhere(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
  ): void;

  paginate(queryBuilder: SelectQueryBuilder<T>) {
    const skip = this.skip ?? 0;
    const limit = this.limit ?? 20;

    queryBuilder.skip(skip).take(limit);
  }
}
