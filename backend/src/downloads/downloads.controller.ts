import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Req,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import type { Request } from 'express';
import { DownloadStatus, Download } from './entities/download.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('status') status?: DownloadStatus,
    @Query('featured') featured?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.downloadsService.findAll({
      category,
      tag,
      search,
      status,
      featured: featured === 'true',
      isAdmin: false,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['downloads.view', 'downloads.manage'])
  @Get('admin')
  async findAllAdmin(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: DownloadStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.downloadsService.findAll({
      category,
      search,
      status,
      isAdmin: true,
      page,
      limit,
    });
  }

  @Public()
  @Get('categories')
  async findAllCategories() {
    return this.downloadsService.findAllCategories();
  }

  @Public()
  @Get('id/:id')
  async findOne(@Param('id') id: string) {
    return this.downloadsService.findOne(id);
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.downloadsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.manage')
  @Post()
  async create(@Body() data: Partial<Download>) {
    return this.downloadsService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.manage')
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Download>) {
    return this.downloadsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.manage')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.downloadsService.remove(id);
  }

  @Public()
  @Post(':id/record')
  async recordDownload(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.downloadsService.recordDownload(id, req.user as any, {
      ip,
      userAgent,
    });
  }
}
