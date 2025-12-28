import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SkusController from './skus.controller';
import Sku from './skus.model';
import SkusService from './skus.service';

const SkusOrmModule = TypeOrmModule.forFeature([Sku]);

@Module({
  controllers: [SkusController],
  imports: [SkusOrmModule],
  providers: [SkusService],
  exports: [SkusService],
})
export default class SkusModule {}
