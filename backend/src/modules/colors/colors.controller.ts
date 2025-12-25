import { Controller, Get, Query } from '@nestjs/common';
import ColorsService from './colors.service';
import ListColorsFilter from './dtos/list-colors.filter';

@Controller('colors')
export default class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Get()
  async list(@Query() filter: ListColorsFilter) {
    const colors = await this.colorsService.list(filter);

    return { colors };
  }
}
