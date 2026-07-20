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
} from './dto/campus-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackType } from './entities/campus-feedback.entity';
import { Public } from '../common/decorators/public.decorator';

/**
 * Backward-compatible /complaints routes — delegates to CampusFeedbackService.
 * @deprecated Use /api/campus-feedback instead.
 */
@Controller('complaints')
export class CampusFeedbackLegacyController {
  constructor(private readonly service: CampusFeedbackService) {}

  @Public()
  @Get('categories')
  getCategories(@Query('type') type?: string) {
    return this.service.getCategories(type);
  }

  @Public()
  @Post('submit')
  submit(
    @Body()
    dto: SubmitCampusFeedbackDto & {
      complaint_type?: string;
      subcategory?: string;
      sentiment?: string;
    },
  ) {
    const mapped: SubmitCampusFeedbackDto = {
      ...dto,
      feedback_type:
        dto.feedback_type ||
        (dto.sentiment === 'Positive'
          ? FeedbackType.COMPLIMENT
          : FeedbackType.COMPLAINT),
      submitter_type: dto.submitter_type || dto.complaint_type,
      sub_category: dto.sub_category || dto.subcategory,
    };
    return this.service.submit(mapped);
  }

  @Public()
  @Post('track')
  track(@Body() body: TrackCampusFeedbackDto) {
    return this.service.track(body.reference_number, body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/analytics')
  getAnalytics() {
    return this.service.getAnalytics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/personnel/assignable')
  getAssignableUsers() {
    return this.service.getAssignableUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCampusFeedbackStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/assign')
  assignStaff(@Param('id') id: string, @Body() dto: AssignCampusFeedbackDto) {
    return this.service.assignStaff(id, dto.staff_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id/suggest-response')
  suggestResponse(@Param('id') id: string) {
    return this.service.suggestResponse(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/responses')
  addResponse(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AddCampusFeedbackResponseDto,
  ) {
    return this.service.addResponse(id, req.user.sub || req.user.userId, dto);
  }
}
