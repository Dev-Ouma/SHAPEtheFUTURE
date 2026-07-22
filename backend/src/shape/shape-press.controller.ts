import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { ShapePressService } from './shape-press.service';
import {
  CreateShapePressDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';

@Controller('shape/press')
export class ShapePressController {
  constructor(private readonly service: ShapePressService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll(false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Body() dto: CreateShapePressDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateShapePressDto>) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
