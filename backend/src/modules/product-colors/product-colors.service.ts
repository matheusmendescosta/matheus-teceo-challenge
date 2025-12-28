import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import { ListProductColorsDTO } from './dtos/list-product-colors.dto';
import ListProductColorsFilter from './dtos/list-product-colors.filter';
import ProductColor from './product-colors.model';
import SkusService from '../skus/skus.service';

@Injectable()
export default class ProductColorsService {
  constructor(
    @InjectRepository(ProductColor)
    private readonly repository: Repository<ProductColor>,
    private readonly skusService: SkusService,
  ) {}

  createQueryBuilder(alias?: string): SelectQueryBuilder<ProductColor> {
    return this.repository.createQueryBuilder(alias || 'productColor');
  }

  async list(
    filter: ListProductColorsFilter,
  ): Promise<Page<ListProductColorsDTO>> {
    // ===============================================
    // Query 1: Contar total (leve - sem joins, apenas COUNT)
    // ===============================================
    const countQueryBuilder = this.createQueryBuilder('productColor');
    filter.createWhere(countQueryBuilder);
    const total = await countQueryBuilder.getCount();

    // ===============================================
    // Query 2: Trazer product colors paginados
    // ===============================================
    const queryBuilder = this.createQueryBuilder('productColor')
      .leftJoinAndSelect('productColor.product', 'product')
      .leftJoinAndSelect('productColor.color', 'color')
      .orderBy('product.name', 'ASC')
      .addOrderBy('productColor.id', 'ASC');

    filter.paginate(queryBuilder);
    filter.createWhere(queryBuilder);

    const productColors = await queryBuilder.getMany();
    const productColorIds = productColors.map((pc) => pc.id);

    // ===============================================
    // Query 3: Trazer skus dos product colors
    // ===============================================
    if (productColorIds.length > 0) {
      const skus = await this.skusService
        .createQueryBuilder('sku')
        .select(['sku.id', 'sku.product_color_id', 'sku.price'])
        .where('sku.product_color_id IN (:...productColorIds)', {
          productColorIds,
        })
        .orderBy('sku.product_color_id', 'ASC')
        .addOrderBy('sku.price', 'ASC')
        .getMany();

      // Agrupar skus por product_color_id em memória (muito rápido!)
      const minPriceByProductColorId = new Map<string, number>();

      for (const sku of skus) {
        const productColorId = sku.product_color_id;

        // Como está ordenado por price ASC, o primeiro é o menor
        if (!minPriceByProductColorId.has(productColorId)) {
          minPriceByProductColorId.set(productColorId, sku.price);
        }
      }

      // Associar preços aos product colors
      productColors.forEach((productColor) => {
        const price = minPriceByProductColorId.get(productColor.id) || 0;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (productColor as any).price = price;
      });
    } else {
      productColors.forEach((productColor) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (productColor as any).price = 0;
      });
    }

    const productColorsWithDetails = productColors.map((pc) => ({
      id: pc.id,
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt,
      product: pc.product,
      color: pc.color,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      price: (pc as any).price,
    })) as ListProductColorsDTO[];

    return Page.of(productColorsWithDetails, total);
  }
}
