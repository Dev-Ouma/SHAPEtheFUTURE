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
import { ShapeDocumentsService } from './shape-documents.service';
import {
  CreateShapeDocumentDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';

@Controller('shape/documents')
export class ShapeDocumentsController {
  constructor(private readonly service: ShapeDocumentsService) {}

  @Public()
  @Get()
  findAll(@Query('category') category?: string) {
    return this.service.findAll(false, category);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Body() dto: CreateShapeDocumentDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeDocumentDto>,
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
