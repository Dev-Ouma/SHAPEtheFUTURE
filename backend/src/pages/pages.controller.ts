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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get()
  findAll(@Query('locale') locale?: string) {
    return this.pagesService.findAll(locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['pages.view', 'pages.manage'])
  @Get('admin')
  findAdmin() {
    return this.pagesService.findAllAdmin();
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get('slug')
  findBySlug(@Query('slug') slug: string, @Query('locale') locale?: string) {
    return this.pagesService.findBySlug(slug, locale);
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(300 * 1000)
  @Get('categories')
  getCategories() {
    return this.pagesService.getCategories();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages.manage')
  @Post()
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages.manage')
  @Post('bulk-seed')
  bulkSeed(@Body() pages: CreatePageDto[]) {
    return Promise.all(pages.map((page) => this.pagesService.upsert(page)));
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePageDto: any) {
    return this.pagesService.update(id, updatePageDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages.manage')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: { status: string; approver_id?: string; review_notes?: string },
  ) {
    return this.pagesService.updateStatus(
      id,
      body.status,
      body.approver_id,
      body.review_notes,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('pages.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
