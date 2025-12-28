import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ProductColorsController from './product-colors.controller';
import ProductColor from './product-colors.model';
import ProductColorsService from './product-colors.service';
import SkusModule from '../skus/skus.module';
import ProductsModule from '../products/products.module';
import ColorsModule from '../colors/colors.module';

const ProductColorsOrmModule = TypeOrmModule.forFeature([ProductColor]);

@Module({
  controllers: [ProductColorsController],
  imports: [ProductColorsOrmModule, SkusModule, ProductsModule, ColorsModule],
  providers: [ProductColorsService],
  exports: [],
})
export default class ProductColorsModule {}
