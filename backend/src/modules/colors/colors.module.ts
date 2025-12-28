import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ColorsController from './colors.controller';
import Color from './colors.model';
import ColorsService from './colors.service';

const ColorsOrmModule = TypeOrmModule.forFeature([Color]);

@Module({
  controllers: [ColorsController],
  imports: [ColorsOrmModule],
  providers: [ColorsService],
  exports: [ColorsService],
})
export default class ColorsModule {}
