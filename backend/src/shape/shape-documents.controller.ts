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

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Req() req: any, @Query('category') category?: string) {
    return this.service.findAll(
      true,
      category,
      req.partnerScopeId || undefined,
    );
  }

  @Public()
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.service.findOne(identifier, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Req() req: any, @Body() dto: CreateShapeDocumentDto) {
    if (req.partnerScopeId) {
      dto.partner_id = req.partnerScopeId;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeDocumentDto>,
  ) {
    await this.assertOwnsDocument(req, id);
    if (req.partnerScopeId) {
      dto.partner_id = req.partnerScopeId;
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.assertOwnsDocument(req, id);
    return this.service.remove(id);
  }

  private async assertOwnsDocument(req: any, id: string) {
    if (!req.partnerScopeId) return;
    const doc = await this.service.findOne(id, true);
    if (doc.partner_id !== req.partnerScopeId) {
      throw new ForbiddenException(
        'You can only manage documents for your institution.',
      );
    }
  }
}
