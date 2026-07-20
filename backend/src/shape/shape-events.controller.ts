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
import { ShapeEventsService } from './shape-events.service';
import {
  CreateShapeEventDto,
  SHAPE_MANAGE_PERMS,
  SHAPE_VIEW_PERMS,
} from './dto/shape.dto';

@Controller('shape/events')
export class ShapeEventsController {
  constructor(private readonly service: ShapeEventsService) {}

  @Public()
  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(false, status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_VIEW_PERMS])
  @Get('admin')
  findAllAdmin(@Req() req: any, @Query('status') status?: string) {
    return this.service.findAll(true, status, req.partnerScopeId || undefined);
  }

  @Public()
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.service.findOne(identifier, false);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Post()
  create(@Req() req: any, @Body() dto: CreateShapeEventDto) {
    if (req.partnerScopeId) {
      dto.host_partner_id = req.partnerScopeId;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateShapeEventDto>,
  ) {
    await this.assertOwnsEvent(req, id);
    if (req.partnerScopeId) {
      dto.host_partner_id = req.partnerScopeId;
    }
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, PartnerScopeGuard)
  @RequirePermission([...SHAPE_MANAGE_PERMS])
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.assertOwnsEvent(req, id);
    return this.service.remove(id);
  }

  private async assertOwnsEvent(req: any, id: string) {
    if (!req.partnerScopeId) return;
    const event = await this.service.findOne(id, true);
    if (event.host_partner_id !== req.partnerScopeId) {
      throw new ForbiddenException(
        'You can only manage events hosted by your institution.',
      );
    }
  }
}
