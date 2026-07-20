import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EResourcesService } from './e-resources.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission } from '../../auth/decorators/permissions.decorator';

@Controller('library/e-resources')
export class EResourcesController {
  constructor(private readonly eResourcesService: EResourcesService) {}

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('subjectId') subjectId?: string,
    @Query('providerId') providerId?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    return this.eResourcesService.findAll({
      search,
      type,
      subjectId,
      providerId,
      isFeatured:
        isFeatured === 'true'
          ? true
          : isFeatured === 'false'
            ? false
            : undefined,
      status: 'Published',
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('admin')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('subjectId') subjectId?: string,
    @Query('providerId') providerId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('status') status?: string,
  ) {
    return this.eResourcesService.findAll({
      search,
      type,
      subjectId,
      providerId,
      isFeatured:
        isFeatured === 'true'
          ? true
          : isFeatured === 'false'
            ? false
            : undefined,
      status: status && status !== 'all' ? status : undefined,
    });
  }

  @Public()
  @Get('providers')
  findAllProviders() {
    return this.eResourcesService.findAllProviders();
  }

  @Public()
  @Get('subjects')
  findAllSubjects() {
    return this.eResourcesService.findAllSubjects();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.eResourcesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eResourcesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post()
  create(@Body() data: any) {
    return this.eResourcesService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.eResourcesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eResourcesService.remove(id);
  }

  @Public()
  @Post(':id/view')
  incrementViews(@Param('id') id: string) {
    return this.eResourcesService.incrementViews(id);
  }

  @Public()
  @Post(':id/click')
  incrementClicks(@Param('id') id: string) {
    return this.eResourcesService.incrementClicks(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post('providers')
  createProvider(@Body() data: any) {
    return this.eResourcesService.createProvider(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete('providers/:id')
  removeProvider(@Param('id') id: string) {
    return this.eResourcesService.removeProvider(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post('subjects')
  createSubject(@Body() data: any) {
    return this.eResourcesService.createSubject(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete('subjects/:id')
  removeSubject(@Param('id') id: string) {
    return this.eResourcesService.removeSubject(id);
  }
}
