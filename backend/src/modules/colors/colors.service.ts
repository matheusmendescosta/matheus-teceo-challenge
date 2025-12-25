import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Color from './colors.model';
import ListColorsFilter from './dtos/list-colors.filter';

@Injectable()
export default class ColorsService {
  constructor(
    @InjectRepository(Color)
    private readonly repository: Repository<Color>,
  ) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<Color> {
    return this.repository.createQueryBuilder(alias);
  }

  list(filter: ListColorsFilter) {
    const queryBuilder = this.createQueryBuilder('color');

    filter.createWhere(queryBuilder, 'color');
    filter.paginate(queryBuilder);

    return queryBuilder.getMany();
  }
}
