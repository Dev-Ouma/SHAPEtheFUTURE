import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TechnicalSupportService } from './technical-support.service';
import {
  CreateTechnicalSupportTicketDto,
  SubmitTechnicalSupportDto,
  UpdateTechnicalSupportStatusDto,
  AddTechnicalSupportNoteDto,
  TechnicalSupportListQueryDto,
} from './dto/technical-support.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/technical-support')
export class TechnicalSupportController {
  constructor(private readonly service: TechnicalSupportService) {}

  @Public()
  @Get('categories')
  getCategories(@Query('role') role?: string) {
    return this.service.getCategories(role);
  }

  @Public()
  @Post('submit')
  submit(@Body() dto: SubmitTechnicalSupportDto) {
    return this.service.submitPublic(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  create(@Body() dto: CreateTechnicalSupportTicketDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub || req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/my-tickets')
  myTickets(@Request() req: any) {
    return this.service.findMyTickets(req.user.sub || req.user.userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('technical_support.manage')
  @Get('tickets')
  findAll(@Query() query: TechnicalSupportListQueryDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('technical_support.manage')
  @Get('analytics/ict')
  getAnalytics() {
    return this.service.getIctAnalytics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/:id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const isIct =
      req.user.role === 'ict' ||
      req.user.role === 'admin' ||
      req.user.role === 'super_admin';
    return this.service.findById(id, userId, isIct);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('technical_support.manage')
  @Patch('tickets/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicalSupportStatusDto,
    @Request() req: any,
  ) {
    return this.service.updateStatus(id, dto, req.user.sub || req.user.userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('technical_support.manage')
  @Post('tickets/:id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: AddTechnicalSupportNoteDto,
    @Request() req: any,
  ) {
    return this.service.addNote(id, dto, req.user.sub || req.user.userId);
  }
}
