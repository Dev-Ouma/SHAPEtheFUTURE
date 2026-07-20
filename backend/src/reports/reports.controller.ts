import {
  Controller,
  Get,
  Query,
  Body,
  Post,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('reports.view')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive-summary')
  async getExecutiveSummary(@Query() filters: any) {
    return this.reportsService.getExecutiveSummary(filters);
  }

  @Get('website-analytics')
  async getWebsiteAnalytics(@Query() filters: any) {
    return this.reportsService.getWebsiteAnalytics(filters);
  }

  @Get('academic')
  async getAcademicReports(@Query() filters: any) {
    return this.reportsService.getAcademicReports(filters);
  }

  @Get('complaints')
  async getComplaintsReports(@Query() filters: any) {
    return this.reportsService.getComplaintsReports(filters);
  }

  @Get('research-alumni')
  async getResearchAndAlumniReports(@Query() filters: any) {
    return this.reportsService.getResearchAndAlumniReports(filters);
  }

  @Get('ai-search')
  async getAiReports(@Query() filters: any) {
    return this.reportsService.getAiReports(filters);
  }

  @Post('ai-summary')
  async generateAiSummary(@Body() data: any) {
    const summary = await this.reportsService.generateAiSummary(data);
    return { summary };
  }

  // Legacy endpoints for backwards compatibility during migration
  @Get('summary')
  async getSummary() {
    return this.reportsService.getSummaryKPIs();
  }

  @Get('distributions')
  async getDistributions() {
    return this.reportsService.getDistributions();
  }

  @Get('redress-analytics')
  async getRedressAnalytics() {
    return this.reportsService.getRedressAnalytics();
  }

  @Get('export')
  async exportRegistry(@Query() filters: any, @Res() res: Response) {
    const domain = filters.domain || 'programmes';
    const data = await this.reportsService.getRegistryData(domain, filters);
    const csv = await this.reportsService.generateCSV(domain, data);

    const filename = `OUK_Report_${domain}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(HttpStatus.OK).send(csv);
  }
}
