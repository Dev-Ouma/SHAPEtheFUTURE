import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get()
  findAll(
    @Query('position') position?: string,
    @Query('locale') locale?: string,
  ) {
    return this.menusService.findAll(position, locale);
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.menusService.findBySlug(slug, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('menus.manage')
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('menus.manage')
  @Patch('reorder')
  reorder(@Body() items: { id: string; order: number }[]) {
    return this.menusService.reorder(items);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('menus.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.menusService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('menus.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
