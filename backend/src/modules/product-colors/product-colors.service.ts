import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import { ListProductColorsDTO } from './dtos/list-product-colors.dto';
import ListProductColorsFilter from './dtos/list-product-colors.filter';
import ProductColor from './product-colors.model';

@Injectable()
export default class ProductColorsService {
  constructor(
    @InjectRepository(ProductColor)
    private readonly repository: Repository<ProductColor>,
  ) {}

  createQueryBuilder(): SelectQueryBuilder<ProductColor> {
    return this.repository.createQueryBuilder('productColor');
  }

  async list(
    filter: ListProductColorsFilter,
  ): Promise<Page<ListProductColorsDTO>> {
    const queryBuilder = this.createQueryBuilder()
      .leftJoinAndSelect('productColor.product', 'product')
      .orderBy('product.name', 'ASC')
      .addOrderBy('productColor.id', 'ASC');

    filter.paginate(queryBuilder);
    filter.createWhere(queryBuilder);

    const [productColors, total] = await queryBuilder.getManyAndCount();
    const productColorsWithColors =
      await this.getColorsForProductColors(productColors);
    const productColorsWithPrices = await this.getPricesForProductColors(
      productColorsWithColors,
    );

    return Page.of(productColorsWithPrices, total);
  }

  async getColorsForProductColors(productColors: ProductColor[]) {
    for (const productColor of productColors) {
      const productColorWithColor = await this.createQueryBuilder()
        .leftJoinAndSelect('productColor.color', 'color')
        .where('productColor.id = :id', { id: productColor.id })
        .orderBy('lower(color.name)', 'ASC')
        .getOneOrFail();

      const correctProductColor = productColors.find(
        (pc) => pc.id === productColor.id,
      );

      if (correctProductColor) {
        correctProductColor.color = productColorWithColor.color;
      }
    }

    return productColors;
  }

  async getPricesForProductColors(
    productColors: ProductColor[],
  ): Promise<ListProductColorsDTO[]> {
    const productColorsWithPrices: ListProductColorsDTO[] = [];

    for (const productColor of productColors) {
      const productColorWithPrices = await this.createQueryBuilder()
        .leftJoinAndSelect('productColor.skus', 'sku')
        .where('productColor.id = :id', { id: productColor.id })
        .getMany();

      const skuPrices = productColorWithPrices.flatMap((pc) =>
        pc.skus.map((sku) => sku.price),
      );

      productColorsWithPrices.push({
        ...productColor,
        price: Math.min(...skuPrices),
      });
    }

    return productColorsWithPrices;
  }
}
