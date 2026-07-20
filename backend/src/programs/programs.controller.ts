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
import { ProgramsService } from './programs.service';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('programmes')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(60 * 1000) // Cache for 60 seconds
  @Get()
  findAll(@Query() query: any) {
    const options = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      schoolSlug: query.school,
      departmentSlug: query.department,
      level: query.level,
      mode: query.mode,
      isAdmin: false,
      locale: query.locale,
    };
    return this.programsService.findAll(options);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['programmes.view', 'programmes.manage'])
  @Get('admin')
  findAllAdmin(@Query() query: any) {
    const options = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      schoolSlug: query.school,
      departmentSlug: query.department,
      level: query.level,
      mode: query.mode,
      status: query.status,
      isAdmin: true,
    };
    return this.programsService.findAll(options);
  }

  /** Returns count of programmes pending content review — used for admin sidebar badge */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['programmes.view', 'programmes.manage'])
  @Get('review-count')
  async getReviewCount() {
    const result = await this.programsService.findAll({
      status: 'REVIEW',
      isAdmin: true,
      limit: 1000,
    });
    return { count: result.total };
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.programsService.findBySlug(slug, false, locale);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.programsService.findOne(id, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Post()
  create(@Body() createProgramDto: any) {
    return this.programsService.create(createProgramDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: any) {
    return this.programsService.update(id, updateProgramDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.programsService.update(id, { status });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programsService.remove(id);
  }
}
