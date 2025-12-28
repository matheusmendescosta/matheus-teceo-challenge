import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import ListSkusFilter from './dtos/list-skus.filter';
import Sku from './skus.model';

@Injectable()
export default class SkusService {
  constructor(
    @InjectRepository(Sku)
    private readonly repository: Repository<Sku>,
  ) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<Sku> {
    return this.repository.createQueryBuilder(alias);
  }

  async list(filter: ListSkusFilter): Promise<Page<Sku>> {
    const queryBuilder = this.createQueryBuilder('sku');

    filter.paginate(queryBuilder);
    filter.createWhere(queryBuilder);

    const [skus, total] = await queryBuilder.getManyAndCount();

    return Page.of(skus, total);
  }
}
