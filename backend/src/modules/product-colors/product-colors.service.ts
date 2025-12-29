import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/commons/cache/cache.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import SkusService from '../skus/skus.service';
import { ListProductColorsDTO } from './dtos/list-product-colors.dto';
import ListProductColorsFilter from './dtos/list-product-colors.filter';
import ProductColor from './product-colors.model';

@Injectable()
export default class ProductColorsService {
  constructor(
    @InjectRepository(ProductColor)
    private readonly repository: Repository<ProductColor>,
    private readonly skusService: SkusService,
    private readonly cacheService: CacheService,
  ) {}

  createQueryBuilder(alias?: string): SelectQueryBuilder<ProductColor> {
    return this.repository.createQueryBuilder(alias || 'productColor');
  }

  async list(
    filter: ListProductColorsFilter,
  ): Promise<Page<ListProductColorsDTO>> {
    const cacheKey = this.cacheService.generateCacheKey('product-colors:list', {
      skip: filter.skip,
      limit: filter.limit,
      productCodeOrName: filter.productCodeOrName,
    });

    const cachedResult =
      await this.cacheService.get<Page<ListProductColorsDTO>>(cacheKey);
    if (cachedResult) {
      console.log('Ok Cache:', cacheKey);
      return cachedResult;
    }
    console.log('Sem cache:', cacheKey);

    const countQueryBuilder = this.createQueryBuilder('productColor');
    filter.createWhere(countQueryBuilder);
    const total = await countQueryBuilder.distinct(true).getCount();

    const idsQueryBuilder = this.createQueryBuilder('productColor')
      .select(['productColor.id'])
      .orderBy('productColor.id', 'ASC');

    filter.paginate(idsQueryBuilder);
    filter.createWhere(idsQueryBuilder);

    const idsResult = await idsQueryBuilder.getMany();
    const productColorIds = idsResult.map((pc) => pc.id);

    let productColors: ProductColor[] = [];
    let skus: any[] = [];

    if (productColorIds.length > 0) {
      const queryBuilder = this.createQueryBuilder('productColor')
        .leftJoinAndSelect('productColor.product', 'product')
        .leftJoinAndSelect('productColor.color', 'color')
        .where('productColor.id IN (:...productColorIds)', {
          productColorIds,
        })
        .orderBy('product.name', 'ASC')
        .addOrderBy('productColor.id', 'ASC');

      productColors = await queryBuilder.getMany();

      skus = await this.skusService
        .createQueryBuilder('sku')
        .select(['sku.id', 'sku.product_color_id', 'sku.price'])
        .where('sku.product_color_id IN (:...productColorIds)', {
          productColorIds,
        })
        .orderBy('sku.product_color_id', 'ASC')
        .addOrderBy('sku.price', 'ASC')
        .getMany();
    }

    const minPriceByProductColorId = new Map<string, number>();

    for (const sku of skus) {
      //eslint-disable-next-line
      const productColorId = sku.product_color_id;
      if (!minPriceByProductColorId.has(productColorId)) {
        //eslint-disable-next-line
        minPriceByProductColorId.set(productColorId, sku.price);
      }
    }

    // Associar preços aos product colors
    productColors.forEach((productColor) => {
      const price = minPriceByProductColorId.get(productColor.id) || 0;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (productColor as any).price = price;
    });

    const productColorsWithDetails = productColors.map((pc) => ({
      id: pc.id,
      createdAt: pc.createdAt,
      updatedAt: pc.updatedAt,
      product: pc.product,
      color: pc.color,
      // eslint-disable-next-line
      price: (pc as any).price,
    })) as ListProductColorsDTO[];

    const result = Page.of(productColorsWithDetails, total);

    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }
}
