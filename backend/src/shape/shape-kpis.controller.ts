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
import { ShapeKpisService } from './shape-kpis.service';
import {
  CreateShapeKpiDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';
import { assertConsortiumCoordinator } from './shape-partner-scope.util';

@Controller('shape/kpis')
export class ShapeKpisController {
  constructor(private readonly service: ShapeKpisService) {}

  @Public()
  @Get()
  findAll(@Query('category') category?: string) {
    return this.service.findAll(false, category);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Query('category') category?: string) {
    return this.service.findAll(true, category);
  }

  @Public()
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.service.findOne(identifier, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Req() req: any, @Body() dto: CreateShapeKpiDto) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeKpiDto>,
  ) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.remove(id);
  }
}
