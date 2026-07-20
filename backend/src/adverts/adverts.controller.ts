import { Public } from '../common/decorators/public.decorator';
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
import { AdvertsService } from './adverts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('adverts')
export class AdvertsController {
  constructor(private readonly advertsService: AdvertsService) {}

  @Public()
  @Get()
  findAll(@Query('locale') locale?: string) {
    return this.advertsService.findAll(locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['adverts.view', 'adverts.manage'])
  @Get('admin')
  findAllAdmin() {
    return this.advertsService.findAllAdmin();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.advertsService.findOne(id, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('adverts.manage')
  @Post()
  create(@Body() data: any) {
    return this.advertsService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('adverts.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.advertsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('adverts.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advertsService.remove(id);
  }
}
