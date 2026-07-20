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
  UseGuards,
} from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Public()
  @Post('join')
  async joinNetwork(@Body() data: any) {
    return this.alumniService.registerPublicProfile(data);
  }

  @Public()
  @Get('profiles')
  async getProfiles(@Query() query: any) {
    return this.alumniService.findAllProfiles(query);
  }

  @Public()
  @Get('profiles/featured')
  async getFeaturedProfiles() {
    return this.alumniService.findFeaturedProfiles();
  }

  @Public()
  @Get('mentors')
  async getMentors() {
    return this.alumniService.findActiveMentors();
  }

  @Public()
  @Get('events')
  async getEvents(@Query('locale') locale?: string) {
    return this.alumniService.findUpcomingEvents(locale);
  }

  @Public()
  @Get('stories')
  async getStories() {
    return this.alumniService.findLatestStories();
  }

  @Public()
  @Get('careers')
  async getCareers() {
    return this.alumniService.findActiveCareers();
  }

  @Public()
  @Get('chapters')
  async getChapters() {
    return this.alumniService.findAllChapters();
  }

  @Public()
  @Get('stats')
  async getStats() {
    return this.alumniService.getStats();
  }

  // --- ADMINISTRATIVE MANAGEMENT ---

  @Post('admin/profiles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProfile(@Body() data: any) {
    return this.alumniService.createProfile(data);
  }

  @Patch('admin/profiles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProfile(@Param('id') id: string, @Body() data: any) {
    return this.alumniService.updateProfile(id, data);
  }

  @Delete('admin/profiles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteProfile(@Param('id') id: string) {
    return this.alumniService.deleteProfile(id);
  }

  @Post('admin/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createEvent(@Body() data: any) {
    return this.alumniService.createEvent(data);
  }

  @Patch('admin/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateEvent(@Param('id') id: string, @Body() data: any) {
    return this.alumniService.updateEvent(id, data);
  }

  @Delete('admin/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteEvent(@Param('id') id: string) {
    return this.alumniService.deleteEvent(id);
  }

  @Post('admin/stories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createStory(@Body() data: any) {
    return this.alumniService.createStory(data);
  }

  @Patch('admin/stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStory(@Param('id') id: string, @Body() data: any) {
    return this.alumniService.updateStory(id, data);
  }

  @Delete('admin/stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteStory(@Param('id') id: string) {
    return this.alumniService.deleteStory(id);
  }

  @Post('admin/careers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCareer(@Body() data: any) {
    return this.alumniService.createCareer(data);
  }

  @Patch('admin/careers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCareer(@Param('id') id: string, @Body() data: any) {
    return this.alumniService.updateCareer(id, data);
  }

  @Delete('admin/careers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCareer(@Param('id') id: string) {
    return this.alumniService.deleteCareer(id);
  }

  @Post('admin/chapters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createChapter(@Body() data: any) {
    return this.alumniService.createChapter(data);
  }

  @Patch('admin/chapters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateChapter(@Param('id') id: string, @Body() data: any) {
    return this.alumniService.updateChapter(id, data);
  }

  @Delete('admin/chapters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteChapter(@Param('id') id: string) {
    return this.alumniService.deleteChapter(id);
  }
}
