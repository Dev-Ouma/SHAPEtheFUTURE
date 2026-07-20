import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { IctService } from './ict.service';
import { IctStatusService } from './ict-status.service';
import { IctKbService } from './ict-kb.service';
import { IctPasswordService } from './ict-password.service';
import {
  CreateTicketDto,
  SubmitPublicTicketDto,
  UpdateTicketStatusDto,
  AssignTicketDto,
  AddTicketResponseDto,
  UpsertCategoryDto,
} from './dto/ict.dto';
import {
  CreateSystemDto,
  UpdateSystemDto,
  UpdateSystemStatusDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  AddIncidentUpdateDto,
} from './dto/ict-status.dto';
import {
  CreateKbArticleDto,
  UpdateKbArticleDto,
  KbFeedbackDto,
} from './dto/ict-kb.dto';
import {
  PasswordTargetDto,
  GrantModuleDto,
  RevokeGrantDto,
} from './dto/ict-password.dto';

// PermissionsGuard only enforces routes carrying @RequirePermission; requester/public
// routes have none and remain open to any authenticated user (or anyone, if @Public).
@UseGuards(PermissionsGuard)
@Controller('ict')
export class IctController {
  constructor(
    private readonly ictService: IctService,
    private readonly statusService: IctStatusService,
    private readonly kbService: IctKbService,
    private readonly passwordService: IctPasswordService,
  ) {}

  // ─── Public intake (merged Complaints & Compliments form) ────────────────
  // The public form ships a static category list, so there is no
  // categories-lookup endpoint here — only the submission route.

  @Public()
  @Post('public/submit')
  submitPublic(@Body() dto: SubmitPublicTicketDto) {
    return this.ictService.submitPublicTicket(dto);
  }

  // ─── Requester endpoints (any authenticated staff/student) ───────────────

  @Get('categories')
  getActiveCategories() {
    return this.ictService.getCategories(true);
  }

  @Post('tickets')
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    const requesterId = req.user?.sub || req.user?.id;
    return this.ictService.createTicket(dto, requesterId);
  }

  @Get('tickets/mine')
  findMine(@Request() req: any) {
    const requesterId = req.user?.sub || req.user?.id;
    return this.ictService.findMine(requesterId);
  }

  @Public()
  @Get('tickets/track/:ref')
  trackTicket(@Param('ref') ref: string) {
    return this.ictService.trackTicket(ref);
  }

  // ─── Admin / ICT staff endpoints (require ict.* permissions) ─────────────

  // Full queue + analytics: lane-scoped via service_group (ict / helpdesk permissions).
  @Get('admin/tickets')
  findAllAdmin(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.findAllAdmin(serviceGroup, userId);
  }

  @Get('admin/analytics')
  getAnalytics(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.getAnalytics(serviceGroup, userId);
  }

  @Get('admin/analytics/personal')
  getPersonalAnalytics(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
    @Query('range') range?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.getPersonalAnalytics(userId, serviceGroup, range);
  }

  @Get('admin/analytics/queue')
  getQueueAnalytics(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
    @Query('range') range?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.getQueueAnalytics(userId, serviceGroup, range);
  }

  // Complaint/compliment analytics for executive dashboards (e.g. DVC Infrastructure,
  // the Strategic Reports "Complaints & Feedback" tab).
  @RequirePermission(['reports.view', 'infrastructure_analytics.view'])
  @Get('admin/analytics/feedback')
  getFeedbackAnalytics(
    @Request() req: any,
    @Query('infrastructure_only') infrastructureOnly?: string,
    @Query('feedback_type') feedbackType?: string,
    @Query('range') range?: string,
    @Query('service_group') serviceGroup?: string,
    @Query('velocity') velocity?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.getFeedbackAnalytics(
      infrastructureOnly === 'true',
      feedbackType,
      range,
      serviceGroup,
      userId,
      velocity || 'monthly',
    );
  }

  // ─── Officer desk (any authenticated user, scoped to their assigned tickets) ──
  // The service enforces that non-privileged users can only see/act on tickets
  // assigned to them, so these routes stay open to everyone with an account.

  @Get('admin/tickets/assigned/mine')
  findAssignedToMe(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.findAssignedToMe(userId, serviceGroup);
  }

  @Get('admin/tickets/assigned/mine/count')
  countAssignedToMe(
    @Request() req: any,
    @Query('service_group') serviceGroup?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.ictService.countAssignedOpen(userId, serviceGroup);
  }

  @Get('admin/personnel/assignable')
  getAssignableUsers() {
    return this.ictService.getAssignableUsers();
  }

  @Get('admin/tickets/:id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ictService.findOneAdmin(id, req.user?.sub || req.user?.id);
  }

  @RequirePermission([
    'ict.manage',
    'helpdesk.manage',
    'campus_feedback.manage',
  ])
  @Post('admin/tickets')
  logTicketOnBehalf(@Request() req: any, @Body() dto: CreateTicketDto) {
    // Admin-logged tickets carry requester details from the DTO, not the agent's identity.
    // Skip AI triage — the officer already chose lane, category, and subcategory.
    return this.ictService.createTicket(dto, undefined, { skipTriage: true });
  }

  @Put('admin/tickets/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ictService.updateStatus(id, dto, req.user?.sub || req.user?.id);
  }

  @Put('admin/tickets/:id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: AssignTicketDto,
  ) {
    return this.ictService.assign(
      id,
      dto.assignee_id,
      req.user?.sub || req.user?.id,
    );
  }

  @Post('admin/tickets/:id/responses')
  addResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: AddTicketResponseDto,
  ) {
    const authorId = req.user?.sub || req.user?.id;
    return this.ictService.addResponse(id, authorId, dto);
  }

  @Get('admin/tickets/:id/suggest-response')
  suggestResponse(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ictService.suggestResponse(id, req.user?.sub || req.user?.id);
  }

  @Get('admin/tickets/:id/suggested-articles')
  suggestedArticles(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.ictService.suggestedArticles(id, req.user?.sub || req.user?.id);
  }

  // ─── Category management ─────────────────────────────────────────────────

  @RequirePermission(['ict.view', 'helpdesk.view', 'campus_feedback.view'])
  @Get('admin/categories')
  getAllCategories(@Query('activeOnly') activeOnly?: string) {
    return this.ictService.getCategories(activeOnly === 'true');
  }

  @RequirePermission('ict.manage')
  @Post('admin/categories')
  createCategory(@Body() dto: UpsertCategoryDto) {
    return this.ictService.createCategory(dto);
  }

  @RequirePermission('ict.manage')
  @Put('admin/categories/:id')
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertCategoryDto,
  ) {
    return this.ictService.updateCategory(id, dto);
  }

  @RequirePermission('ict.manage')
  @Delete('admin/categories/:id')
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.ictService.deleteCategory(id);
  }

  // ─── Service / system status (ict_status.*) ──────────────────────────────

  // Public read-only status board (for a future public status page / portal).
  @Public()
  @Get('status')
  getStatusBoard() {
    return this.statusService.getBoard();
  }

  @RequirePermission('ict_status.view')
  @Get('admin/systems')
  findAllSystems() {
    return this.statusService.findAllSystems();
  }

  @RequirePermission('ict_status.manage')
  @Post('admin/systems')
  createSystem(@Body() dto: CreateSystemDto) {
    return this.statusService.createSystem(dto);
  }

  @RequirePermission('ict_status.manage')
  @Put('admin/systems/:id')
  updateSystem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemDto,
  ) {
    return this.statusService.updateSystem(id, dto);
  }

  @RequirePermission('ict_status.manage')
  @Put('admin/systems/:id/status')
  setSystemStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSystemStatusDto,
  ) {
    return this.statusService.setSystemStatus(id, dto);
  }

  @RequirePermission('ict_status.manage')
  @Delete('admin/systems/:id')
  deleteSystem(@Param('id', ParseUUIDPipe) id: string) {
    return this.statusService.deleteSystem(id);
  }

  @RequirePermission('ict_status.view')
  @Get('admin/incidents')
  findAllIncidents() {
    return this.statusService.findAllIncidents();
  }

  @RequirePermission('ict_status.view')
  @Get('admin/incidents/:id')
  findOneIncident(@Param('id', ParseUUIDPipe) id: string) {
    return this.statusService.findOneIncident(id);
  }

  @RequirePermission('ict_status.manage')
  @Post('admin/incidents')
  createIncident(@Request() req: any, @Body() dto: CreateIncidentDto) {
    const actorId = req.user?.sub || req.user?.id;
    return this.statusService.createIncident(dto, actorId);
  }

  @RequirePermission('ict_status.manage')
  @Put('admin/incidents/:id')
  updateIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.statusService.updateIncident(id, dto);
  }

  @RequirePermission('ict_status.manage')
  @Post('admin/incidents/:id/updates')
  addIncidentUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: AddIncidentUpdateDto,
  ) {
    const actorName = req.user?.email || undefined;
    return this.statusService.addUpdate(id, dto, actorName);
  }

  @RequirePermission('ict_status.manage')
  @Delete('admin/incidents/:id')
  deleteIncident(@Param('id', ParseUUIDPipe) id: string) {
    return this.statusService.deleteIncident(id);
  }

  // Backend infrastructure metrics (DB, memory, disk) — same data as the admin
  // Observability page, available to ICT under ict_status.view.
  @RequirePermission('ict_status.view')
  @Get('admin/system-health')
  getInfraHealth() {
    return this.statusService.getInfraHealth();
  }

  // ─── Password reset desk (ict_password.*) ────────────────────────────────

  @RequirePermission('ict_password.view')
  @Get('admin/password/lookup')
  lookupAccount(@Query('query') query: string) {
    return this.passwordService.lookup(query);
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/reset-link')
  sendResetLink(@Body() dto: PasswordTargetDto) {
    return this.passwordService.sendResetLink(dto.query);
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/provision')
  provisionPassword(@Body() dto: PasswordTargetDto) {
    return this.passwordService.provisionTemporaryPassword(dto.query);
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/unlock')
  unlockAccount(@Body() dto: PasswordTargetDto) {
    return this.passwordService.unlock(dto.query);
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/suspend')
  suspendAccount(@Body() dto: PasswordTargetDto) {
    return this.passwordService.suspend(dto.query);
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/reactivate')
  reactivateAccount(@Body() dto: PasswordTargetDto) {
    return this.passwordService.reactivate(dto.query);
  }

  @RequirePermission('ict_password.view')
  @Get('admin/password/modules')
  grantableModules() {
    return this.passwordService.grantableModules();
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/grant-module')
  grantModule(@Request() req: any, @Body() dto: GrantModuleDto) {
    const actorId = req.user?.sub || req.user?.id;
    return this.passwordService.grantTemporaryModule(
      dto.query,
      dto.permission_id,
      dto.days,
      actorId,
      dto.reason,
    );
  }

  @RequirePermission('ict_password.manage')
  @Post('admin/password/revoke-grant')
  revokeGrant(@Body() dto: RevokeGrantDto) {
    return this.passwordService.revokeGrant(dto.grant_id);
  }

  // ─── Knowledge base (ict_knowledge.*) ────────────────────────────────────

  // Public self-service: published articles only.
  @Public()
  @Get('knowledge')
  listPublishedArticles(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.kbService.findPublished(search, category);
  }

  @Public()
  @Get('knowledge/:slug')
  getPublishedArticle(@Param('slug') slug: string) {
    return this.kbService.findBySlug(slug);
  }

  @Public()
  @Post('knowledge/:slug/feedback')
  recordKbFeedback(@Param('slug') slug: string, @Body() dto: KbFeedbackDto) {
    return this.kbService.recordFeedback(slug, dto.vote as 'yes' | 'no');
  }

  // Admin management
  @RequirePermission('ict_knowledge.view')
  @Get('admin/knowledge/stats')
  getKbStats() {
    return this.kbService.getStats();
  }

  @RequirePermission('ict_knowledge.view')
  @Get('admin/knowledge')
  findAllArticles() {
    return this.kbService.findAllAdmin();
  }

  @RequirePermission('ict_knowledge.view')
  @Get('admin/knowledge/:id')
  findOneArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.kbService.findOneAdmin(id);
  }

  @RequirePermission('ict_knowledge.manage')
  @Post('admin/knowledge')
  createArticle(@Request() req: any, @Body() dto: CreateKbArticleDto) {
    const authorId = req.user?.sub || req.user?.id;
    return this.kbService.create(dto, authorId);
  }

  @RequirePermission('ict_knowledge.manage')
  @Put('admin/knowledge/:id')
  updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKbArticleDto,
  ) {
    return this.kbService.update(id, dto);
  }

  @RequirePermission('ict_knowledge.manage')
  @Delete('admin/knowledge/:id')
  deleteArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.kbService.remove(id);
  }
}
