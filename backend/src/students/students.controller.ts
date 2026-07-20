import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { RegisterStudentDto } from './dto/register-student.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  enroll(@Body() dto: RegisterStudentDto) {
    return this.studentsService.enrollStudent(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.studentsService.findAll();
  }

  @Public()
  @Get('announcements')
  getAnnouncements() {
    return this.studentsService.getPublicAnnouncements();
  }

  @Get('admin/announcements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllAnnouncements() {
    return this.studentsService.getAllAnnouncements();
  }

  @Public()
  @Get('support-services')
  getSupportServices() {
    return this.studentsService.getSupportServices();
  }

  @Public()
  @Get('clubs')
  getClubs() {
    return this.studentsService.getClubs();
  }

  @Public()
  @Post('clubs/:id/join')
  joinClub(
    @Param('id') id: string,
    @Body()
    joinData: {
      studentName: string;
      studentId: string;
      email: string;
      message: string;
    },
  ) {
    return this.studentsService.joinClub(id, joinData);
  }

  @Public()
  @Get('events')
  getEvents(@Query('locale') locale?: string) {
    return this.studentsService.getEvents(locale);
  }

  @Public()
  @Get('success-stories')
  getSuccessStories() {
    return this.studentsService.getSuccessStories();
  }

  @Get('quick-actions')
  getQuickActions() {
    return this.studentsService.getQuickActions();
  }

  @Get('resources')
  getResources() {
    return this.studentsService.getResources();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  // --- ADMINISTRATIVE MANAGEMENT ---

  @Post('admin/announcements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAnnouncement(@Body() data: any) {
    return this.studentsService.createAnnouncement(data);
  }

  @Patch('admin/announcements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAnnouncement(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateAnnouncement(id, data);
  }

  @Delete('admin/announcements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteAnnouncement(@Param('id') id: string) {
    return this.studentsService.deleteAnnouncement(id);
  }

  @Post('admin/support-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createSupportService(@Body() data: any) {
    return this.studentsService.createSupportService(data);
  }

  @Patch('admin/support-services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSupportService(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateSupportService(id, data);
  }

  @Delete('admin/support-services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteSupportService(@Param('id') id: string) {
    return this.studentsService.deleteSupportService(id);
  }

  @Post('admin/clubs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createClub(@Body() data: any) {
    return this.studentsService.createClub(data);
  }

  @Patch('admin/clubs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateClub(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateClub(id, data);
  }

  @Delete('admin/clubs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteClub(@Param('id') id: string) {
    return this.studentsService.deleteClub(id);
  }

  @Post('admin/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createEvent(@Body() data: any) {
    return this.studentsService.createEvent(data);
  }

  @Patch('admin/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateEvent(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateEvent(id, data);
  }

  @Delete('admin/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteEvent(@Param('id') id: string) {
    return this.studentsService.deleteEvent(id);
  }

  // --- QUICK ACTIONS ---

  @Post('admin/quick-actions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createQuickAction(@Body() data: any) {
    return this.studentsService.createQuickAction(data);
  }

  @Patch('admin/quick-actions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateQuickAction(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateQuickAction(id, data);
  }

  @Delete('admin/quick-actions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteQuickAction(@Param('id') id: string) {
    return this.studentsService.deleteQuickAction(id);
  }

  // --- RESOURCES ---

  @Post('admin/resources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createResource(@Body() data: any) {
    return this.studentsService.createResource(data);
  }

  @Patch('admin/resources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateResource(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.updateResource(id, data);
  }

  @Delete('admin/resources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteResource(@Param('id') id: string) {
    return this.studentsService.deleteResource(id);
  }
}
