import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TendersService } from './tenders.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Public()
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('locale') locale?: string,
  ) {
    return this.tendersService.findAll({ status, category, search, locale });
  }

  @Public()
  @Get('categories')
  listCategories() {
    return this.tendersService.listCategories();
  }

  @Public()
  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.tendersService.findOneBySlug(slug, locale);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: any) {
    return this.tendersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.tendersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tendersService.remove(id);
  }
}
