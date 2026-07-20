import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ─── Public: Track events (frontend already consent-gates; throttle spam) ─
  @Public()
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @Post('track')
  async track(@Body() data: any, @Req() req: any) {
    return this.analyticsService.track({
      ...data,
      metadata: {
        ...data.metadata,
        browser: data.metadata?.browser || req.get('user-agent'),
        ip_hash: req.ip,
      },
    });
  }

  // ─── Summary: admin-only (was public — exposed operational metrics) ───
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('analytics.view')
  @Get('summary')
  async getPublicSummary(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getDashboardStats(dayCount);
  }

  // ─── Admin: Overview KPI cards ────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('overview')
  async getOverview(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getOverviewStats(dayCount);
  }

  // ─── Admin: Traffic trend over time ───────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('trend')
  async getTrend(
    @Query('granularity') granularity?: string,
    @Query('days') days?: string,
  ) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getTrafficTrend(
      granularity || 'daily',
      dayCount,
    );
  }

  // ─── Admin: All pages analytics ───────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('pages')
  async getPages(@Query('days') days?: string, @Query('limit') limit?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    const limitCount = limit ? parseInt(limit, 10) : 50;
    return this.analyticsService.getTopPages(dayCount, limitCount);
  }

  // ─── Admin: Device/browser/OS breakdown ───────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('devices')
  async getDevices(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getDeviceBreakdown(dayCount);
  }

  // ─── Admin: Geographic breakdown ──────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('geographic')
  async getGeographic(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getGeographicBreakdown(dayCount);
  }

  // ─── Admin: Traffic sources ───────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('sources')
  async getSources(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getTrafficSources(dayCount);
  }

  // ─── Admin: Search analytics ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('search')
  async getSearch(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getSearchAnalytics(dayCount);
  }

  // ─── Admin: AI / Chat analytics ───────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('chat')
  async getChat(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getChatAnalytics(dayCount);
  }

  // ─── Admin: Real-time active users ────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('realtime')
  async getRealtime() {
    return this.analyticsService.getRealTimeSummary();
  }

  // ─── Admin: First-party RUM (WEB_VITAL) ────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('web-vitals')
  async getWebVitals(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getWebVitalsStats(dayCount);
  }

  // ─── Admin: Legacy dashboard (preserved for admin/page.tsx) ───────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('dashboard')
  async getDashboardStats(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 7;
    return this.analyticsService.getDashboardStats(dayCount);
  }

  // ─── Admin: CSV export ────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @RequirePermission('analytics.view')
  @Get('export')
  async exportData(
    @Query('type') type: string = 'traffic',
    @Query('days') days: string = '30',
    @Res() res: Response,
  ) {
    const dayCount = parseInt(days, 10);
    let data: any;
    const filename = `OUK_Analytics_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (type) {
      case 'pages':
        data = await this.analyticsService.getTopPages(dayCount, 1000);
        break;
      case 'search':
        const search = await this.analyticsService.getSearchAnalytics(dayCount);
        data = search.topSearches;
        break;
      default:
        data = await this.analyticsService.getTrafficTrend('daily', dayCount);
        break;
    }

    const rows = Array.isArray(data) ? data : [];
    const headers = rows.length > 0 ? Object.keys(rows[0]).join(',') : '';
    const body = rows
      .map((r: any) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');

    const csv = `${headers}\n${body}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  }
}
