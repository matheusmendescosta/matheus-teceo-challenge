import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
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

  async list(filter: ListColorsFilter): Promise<Page<Color>> {
    const queryBuilder = this.createQueryBuilder('color');

    filter.createWhere(queryBuilder, 'color');
    filter.paginate(queryBuilder);

    const [colors, total] = await queryBuilder.getManyAndCount();

    return Page.of(colors, total);
  }
}
