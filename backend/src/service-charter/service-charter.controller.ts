import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ServiceCharterService } from './service-charter.service';

@Controller('service-charter')
export class ServiceCharterController {
  constructor(private readonly svc: ServiceCharterService) {}

  // ─── SEED ────────────────────────────────────────────────────────────────

  @Post('seed')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async seed() {
    return this.svc.seed();
  }

  // ─── METRICS (public read, admin write) ──────────────────────────────────

  @Public()
  @Get('metrics')
  async getMetrics() {
    return this.svc.findAllMetrics();
  }

  @Put('metrics/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateMetric(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateMetric(id, body);
  }

  // ─── ITEMS ────────────────────────────────────────────────────────────────

  @Public()
  @Get('items')
  async getItems(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllItems({
      search,
      category,
      isAdmin: false,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Public()
  @Get('items/categories')
  async getItemCategories() {
    return this.svc.getItemCategories();
  }

  @Public()
  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.svc.findOneItem(id);
  }

  @Get('items/admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async getItemsAdmin(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllItems({
      search,
      category,
      isAdmin: true,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Post('items')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async createItem(@Body() body: any) {
    return this.svc.createItem(body);
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateItem(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateItem(id, body);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async removeItem(@Param('id') id: string) {
    return this.svc.removeItem(id);
  }

  // ─── VIDEOS ───────────────────────────────────────────────────────────────

  @Public()
  @Get('videos')
  async getVideos(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllVideos({
      search,
      category,
      isAdmin: false,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Public()
  @Get('videos/categories')
  async getVideoCategories() {
    return this.svc.getVideoCategories();
  }

  @Get('videos/admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async getVideosAdmin(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllVideos({
      search,
      category,
      isAdmin: true,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Post('videos/:id/view')
  @Public()
  async viewVideo(@Param('id') id: string) {
    return this.svc.incrementVideoViews(id);
  }

  @Post('videos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async createVideo(@Body() body: any) {
    return this.svc.createVideo(body);
  }

  @Put('videos/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateVideo(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateVideo(id, body);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async removeVideo(@Param('id') id: string) {
    return this.svc.removeVideo(id);
  }

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  @Public()
  @Get('documents')
  async getDocuments(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('file_type') file_type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllDocuments({
      search,
      category,
      file_type,
      isAdmin: false,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Get('documents/admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async getDocumentsAdmin(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('file_type') file_type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllDocuments({
      search,
      category,
      file_type,
      isAdmin: true,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Post('documents/:id/download')
  @Public()
  async downloadDocument(@Param('id') id: string) {
    return this.svc.incrementDownloadCount(id);
  }

  @Post('documents')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async createDocument(@Body() body: any) {
    return this.svc.createDocument(body);
  }

  @Put('documents/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateDocument(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateDocument(id, body);
  }

  @Delete('documents/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async removeDocument(@Param('id') id: string) {
    return this.svc.removeDocument(id);
  }

  // ─── FAQs ─────────────────────────────────────────────────────────────────

  @Public()
  @Get('faqs')
  async getFaqs(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllFaqs({
      search,
      category,
      isAdmin: false,
      page: page ? +page : 1,
      limit: limit ? +limit : 15,
    });
  }

  @Public()
  @Get('faqs/categories')
  async getFaqCategories() {
    return this.svc.getFaqCategories();
  }

  @Get('faqs/admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async getFaqsAdmin(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllFaqs({
      search,
      category,
      isAdmin: true,
      page: page ? +page : 1,
      limit: limit ? +limit : 15,
    });
  }

  @Post('faqs/:id/view')
  @Public()
  async viewFaq(@Param('id') id: string) {
    return this.svc.incrementFaqViews(id);
  }

  @Post('faqs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async createFaq(@Body() body: any) {
    return this.svc.createFaq(body);
  }

  @Put('faqs/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateFaq(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async removeFaq(@Param('id') id: string) {
    return this.svc.removeFaq(id);
  }

  // ─── NOTICES ──────────────────────────────────────────────────────────────

  @Public()
  @Get('notices')
  async getNotices() {
    return this.svc.findActiveNotices();
  }

  @Get('notices/admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async getNoticesAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAllNotices({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
    });
  }

  @Post('notices')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async createNotice(@Body() body: any) {
    return this.svc.createNotice(body);
  }

  @Put('notices/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async updateNotice(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateNotice(id, body);
  }

  @Delete('notices/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content.manage')
  async removeNotice(@Param('id') id: string) {
    return this.svc.removeNotice(id);
  }
}
