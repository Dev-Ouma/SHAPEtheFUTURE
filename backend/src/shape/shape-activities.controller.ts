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
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PartnerScopeGuard } from '../auth/guards/partner-scope.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapeActivitiesService } from './shape-activities.service';
import { ShapeWorkPackagesService } from './shape-work-packages.service';
import {
  CreateShapeActivityDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';
import { partnerOwnsWorkPackage } from './shape-partner-scope.util';

@Controller('shape/activities')
export class ShapeActivitiesController {
  constructor(
    private readonly service: ShapeActivitiesService,
    private readonly workPackages: ShapeWorkPackagesService,
  ) {}

  @Public()
  @Get()
  findAll(@Query('work_package_id') workPackageId?: string) {
    return this.service.findAll(false, workPackageId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(
    @Req() req: any,
    @Query('work_package_id') workPackageId?: string,
  ) {
    return this.service.findAll(
      true,
      workPackageId,
      req.partnerScopeId || undefined,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  async create(@Req() req: any, @Body() dto: CreateShapeActivityDto) {
    await this.assertWpAccess(req, dto.work_package_id);
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeActivityDto>,
  ) {
    await this.assertOwnsActivity(req, id);
    if (dto.work_package_id) {
      await this.assertWpAccess(req, dto.work_package_id);
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.assertOwnsActivity(req, id);
    return this.service.remove(id);
  }

  private async assertWpAccess(req: any, workPackageId?: string | null) {
    if (!req.partnerScopeId || !workPackageId) return;
    const wp = await this.workPackages.findOne(workPackageId, true);
    if (!partnerOwnsWorkPackage(wp, req.partnerScopeId)) {
      throw new ForbiddenException(
        'You can only attach activities to work packages for your institution.',
      );
    }
  }

  private async assertOwnsActivity(req: any, id: string) {
    if (!req.partnerScopeId) return;
    const item = await this.service.findOne(id, true);
    if (!item.work_package_id) {
      throw new ForbiddenException(
        'This activity is consortium-managed. Contact the coordinator.',
      );
    }
    await this.assertWpAccess(req, item.work_package_id);
  }
}
