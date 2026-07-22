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
  Req,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PartnerScopeGuard } from '../auth/guards/partner-scope.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapeContactService } from './shape-contact.service';
import {
  CreateShapeContactDto,
  UpdateShapeContactStatusDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';
import { assertConsortiumCoordinator } from './shape-partner-scope.util';

@Controller('shape/contact')
export class ShapeContactController {
  constructor(private readonly service: ShapeContactService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateShapeContactDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Req() req: any, @Query('status') status?: string) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.findAll(status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get()
  findAll(@Req() req: any, @Query('status') status?: string) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.findAll(status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateShapeContactStatusDto,
  ) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateShapeContactStatusDto,
  ) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.remove(id);
  }
}
