import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
  AddResponseDto,
  AssignComplaintDto,
} from './dto/create-complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // PUBLIC ENDPOINTS

  @Public()
  @Get('categories')
  getCategories(@Query('type') type?: string) {
    return this.complaintsService.getCategories(type);
  }

  @Public()
  @Post('submit')
  submitComplaint(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.submitComplaint(dto);
  }

  @Public()
  @Post('track')
  trackComplaint(@Body() body: { reference_number: string }) {
    return this.complaintsService.trackComplaint(body.reference_number);
  }

  // ADMIN ENDPOINTS (JWT + complaints permissions)

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['complaints.view', 'complaints.manage'])
  @Get('admin/analytics')
  getAnalytics() {
    return this.complaintsService.getAnalytics();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['complaints.view', 'complaints.manage'])
  @Get('admin/personnel/assignable')
  getAssignableUsers() {
    return this.complaintsService.getAssignableUsers();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['complaints.view', 'complaints.manage'])
  @Get('admin/all')
  findAllAdmin() {
    return this.complaintsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['complaints.view', 'complaints.manage'])
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.complaintsService.findOneAdmin(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('complaints.manage')
  @Put('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto) {
    return this.complaintsService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('complaints.manage')
  @Put('admin/:id/assign')
  assignStaff(@Param('id') id: string, @Body() dto: AssignComplaintDto) {
    return this.complaintsService.assignStaff(id, dto.staff_id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['complaints.view', 'complaints.manage'])
  @Get('admin/:id/suggest-response')
  suggestResponse(@Param('id') id: string) {
    return this.complaintsService.suggestResponse(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('complaints.manage')
  @Post('admin/:id/responses')
  addResponse(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AddResponseDto,
  ) {
    const staffId = req.user.sub || req.user.id;
    return this.complaintsService.addResponse(id, staffId, dto);
  }
}
