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
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { SchoolsService } from './schools.service';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  create(@Body() createData: any) {
    return this.schoolsService.create(createData);
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get()
  findAll(
    @Query('featured') featured?: string,
    @Query('status') status?: string,
    @Query('locale') locale?: string,
  ) {
    return this.schoolsService.findAll({
      is_featured: featured === 'true' ? true : undefined,
      status,
      locale,
    });
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get(':id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    if (id.length === 36 && id.includes('-')) {
      return this.schoolsService.findById(id, locale);
    }
    return this.schoolsService.findBySlug(id, locale);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.schoolsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }
}
