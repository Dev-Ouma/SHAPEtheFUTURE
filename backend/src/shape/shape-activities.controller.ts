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
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapeActivitiesService } from './shape-activities.service';
import {
  CreateShapeActivityDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';

@Controller('shape/activities')
export class ShapeActivitiesController {
  constructor(private readonly service: ShapeActivitiesService) {}

  @Public()
  @Get()
  findAll(@Query('work_package_id') workPackageId?: string) {
    return this.service.findAll(false, workPackageId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Query('work_package_id') workPackageId?: string) {
    return this.service.findAll(true, workPackageId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Body() dto: CreateShapeActivityDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeActivityDto>,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
