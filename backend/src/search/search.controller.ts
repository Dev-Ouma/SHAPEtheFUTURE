import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  search(
    @Query('q') query: string,
    @Query('filter') filter?: string,
    @Query('locale') locale?: string,
  ) {
    return this.searchService.globalSearch(query, filter, locale);
  }

  @Public()
  @Get('suggestions')
  suggestions(@Query('q') query: string, @Query('locale') locale?: string) {
    return this.searchService.getSuggestions(query, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['analytics.view', 'analytics.manage'])
  @Get('analytics')
  getAnalytics() {
    return this.searchService.getAnalytics();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([
    'pages.view',
    'pages.manage',
    'news.view',
    'news.manage',
    'shape.view',
    'shape.manage',
  ])
  @Get('admin')
  adminSearch(@Query('q') query: string) {
    return this.searchService.adminGlobalSearch(query);
  }
}
