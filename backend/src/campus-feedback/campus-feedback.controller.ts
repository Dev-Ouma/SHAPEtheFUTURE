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
import { CampusFeedbackService } from './campus-feedback.service';
import {
  SubmitCampusFeedbackDto,
  TrackCampusFeedbackDto,
  UpdateCampusFeedbackStatusDto,
  AssignCampusFeedbackDto,
  AddCampusFeedbackResponseDto,
  CampusFeedbackListQueryDto,
} from './dto/campus-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/campus-feedback')
export class CampusFeedbackController {
  constructor(private readonly service: CampusFeedbackService) {}

  // --- Public ---

  @Public()
  @Get('categories')
  getCategories(@Query('type') type?: string) {
    return this.service.getCategories(type);
  }

  @Public()
  @Post('submit')
  submit(@Body() dto: SubmitCampusFeedbackDto, @Request() req?: any) {
    const userId = req?.user?.sub || req?.user?.userId;
    return this.service.submit(dto, userId);
  }

  @Public()
  @Post('track')
  track(@Body() body: TrackCampusFeedbackDto) {
    return this.service.track(body.reference_number, body.email);
  }

  // --- Authenticated user ---

  @UseGuards(JwtAuthGuard)
  @Get('my-submissions')
  mySubmissions(@Request() req: any) {
    return this.service.findMySubmissions(req.user.sub || req.user.userId);
  }

  // --- Admin (static routes before :id) ---

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.view')
  @Get('admin/analytics')
  getAnalytics(@Query('infrastructure_only') infrastructureOnly?: string) {
    return this.service.getAnalytics(infrastructureOnly === 'true');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Get('admin/personnel/assignable')
  getAssignableUsers() {
    return this.service.getAssignableUsers();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.view')
  @Get('admin/list')
  findAllAdmin(@Query() query: CampusFeedbackListQueryDto) {
    return this.service.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Put('admin/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCampusFeedbackStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Put('admin/:id/assign')
  assignStaff(@Param('id') id: string, @Body() dto: AssignCampusFeedbackDto) {
    return this.service.assignStaff(id, dto.staff_id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Get('admin/:id/suggest-response')
  suggestResponse(@Param('id') id: string) {
    return this.service.suggestResponse(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('campus_feedback.manage')
  @Post('admin/:id/responses')
  addResponse(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AddCampusFeedbackResponseDto,
  ) {
    const staffId = req.user.sub || req.user.userId;
    return this.service.addResponse(id, staffId, dto);
  }

  // --- User detail (must be last) ---

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.service.findById(id, req.user.sub || req.user.userId);
  }
}
