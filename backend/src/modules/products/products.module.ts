import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ProductsController from './products.controller';
import Product from './products.model';
import ProductsService from './products.service';

const ProductsOrmModule = TypeOrmModule.forFeature([Product]);

@Module({
  controllers: [ProductsController],
  imports: [ProductsOrmModule],
  providers: [ProductsService],
  exports: [ProductsService],
})
export default class ProductsModule {}
