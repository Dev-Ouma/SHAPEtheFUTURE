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
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PartnerScopeGuard } from '../auth/guards/partner-scope.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapeWorkPackagesService } from './shape-work-packages.service';
import {
  CreateWorkPackageDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';
import { partnerOwnsWorkPackage } from './shape-partner-scope.util';

@Controller('shape/work-packages')
export class ShapeWorkPackagesController {
  constructor(private readonly service: ShapeWorkPackagesService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll(false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Req() req: any) {
    return this.service.findAll(true, req.partnerScopeId || undefined);
  }

  @Public()
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.service.findOne(identifier, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkPackageDto) {
    if (req.partnerScopeId) {
      dto.leader_partner_id = req.partnerScopeId;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkPackageDto>,
  ) {
    await this.assertOwnsWp(req, id);
    if (req.partnerScopeId) {
      dto.leader_partner_id = req.partnerScopeId;
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.assertOwnsWp(req, id);
    return this.service.remove(id);
  }

  private async assertOwnsWp(req: any, id: string) {
    if (!req.partnerScopeId) return;
    const wp = await this.service.findOne(id, true);
    if (!partnerOwnsWorkPackage(wp, req.partnerScopeId)) {
      throw new ForbiddenException(
        'You can only manage work packages led by or assigned to your institution.',
      );
    }
  }
}
