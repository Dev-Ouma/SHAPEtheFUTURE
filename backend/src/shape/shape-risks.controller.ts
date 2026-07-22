import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PartnerScopeGuard } from '../auth/guards/partner-scope.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapeRisksService } from './shape-risks.service';
import {
  CreateShapeRiskDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';
import { assertConsortiumCoordinator } from './shape-partner-scope.util';

@Controller('shape/risks')
export class ShapeRisksController {
  constructor(private readonly service: ShapeRisksService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll(false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin() {
    return this.service.findAll(true);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Req() req: any, @Body() dto: CreateShapeRiskDto) {
    assertConsortiumCoordinator(req.partnerScopeId);
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeRiskDto>,
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
