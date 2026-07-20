import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(60 * 1000)
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('school') school?: string,
    @Query('locale') locale?: string,
  ) {
    return this.newsService.findAll({
      page,
      limit,
      search,
      type,
      category,
      admin: false,
      schoolSlug: school,
      locale,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['news.view', 'news.manage'])
  @Get('admin')
  findAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.newsService.findAll({
      page,
      limit,
      search,
      type,
      category,
      status,
      admin: true,
    });
  }

  @Public()
  @Get(':identifier')
  findOne(
    @Param('identifier') identifier: string,
    @Query('locale') locale?: string,
  ) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );
    if (isUuid) {
      return this.newsService.findById(identifier, locale);
    }
    return this.newsService.findBySlug(identifier, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.manage')
  @Post()
  create(@Body() createNewsDto: any) {
    return this.newsService.create(createNewsDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: any) {
    return this.newsService.update(id, updateNewsDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.manage')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: { status: string; approver_id?: string; review_notes?: string },
  ) {
    return this.newsService.updateStatus(
      id,
      body.status,
      body.approver_id,
      body.review_notes,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
