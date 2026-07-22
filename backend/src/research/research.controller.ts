import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchProgrammesService } from './research-programmes.service';
import { PublicationType } from './entities/publication.entity';
import { ResearchProgrammeStatus } from './entities/research-programme.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('research')
export class ResearchController {
  constructor(
    private readonly researchService: ResearchService,
    private readonly programmesService: ResearchProgrammesService,
  ) {}

  @Public()
  @Get('stats')
  getStats() {
    return this.researchService.getStats();
  }

  @Public()
  @Get('programmes/stats')
  getProgrammeStats() {
    return this.programmesService.getStats();
  }

  @Public()
  @Get('publications')
  findAll(
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('type') type?: PublicationType,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('locale') locale?: string,
  ) {
    // Public catalogue never exposes drafts via status=all
    const publicStatus = !status || status === 'all' ? 'Published' : status;
    return this.researchService.findAll({
      search,
      authorId,
      schoolId,
      departmentId,
      type,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status: publicStatus,
      locale,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['programmes.view', 'programmes.manage'])
  @Get('publications/admin')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('type') type?: PublicationType,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.researchService.findAll({
      search,
      authorId,
      schoolId,
      departmentId,
      type,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status: status || 'all',
    });
  }

  @Public()
  @Get('programmes')
  findAllProgrammes(
    @Query('search') search?: string,
    @Query('schoolId') schoolId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: ResearchProgrammeStatus,
    @Query('leadResearcherId') leadResearcherId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('statusVisibility') statusVisibility?: string,
  ) {
    return this.programmesService.findAll({
      search,
      schoolId,
      departmentId,
      status,
      leadResearcherId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      statusVisibility,
    });
  }

  @Public()
  @Get('programmes/slug/:slug')
  findProgrammeBySlug(@Param('slug') slug: string) {
    return this.programmesService.findOneBySlug(slug);
  }

  @Public()
  @Get('programmes/:id')
  findProgramme(@Param('id') id: string) {
    return this.programmesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Post('programmes')
  createProgramme(@Body() data: any) {
    return this.programmesService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Patch('programmes/:id')
  updateProgramme(@Param('id') id: string, @Body() data: any) {
    return this.programmesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Delete('programmes/:id')
  removeProgramme(@Param('id') id: string) {
    return this.programmesService.remove(id);
  }

  @Public()
  @Get('publications/slug/:slug')
  findOneBySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.researchService.findOneBySlug(slug, locale);
  }

  @Public()
  @Get('projects')
  findAllProjects(
    @Query('search') search?: string,
    @Query('personId') personId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('school') schoolSlug?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.researchService.findAllProjects({
      search,
      personId,
      schoolId,
      schoolSlug,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Public()
  @Get('projects/:id')
  findOneProject(@Param('id') id: string) {
    return this.researchService.findOneProject(id);
  }

  @Public()
  @Get('grants')
  findAllGrants(
    @Query('search') search?: string,
    @Query('personId') personId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('funderName') funderName?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.researchService.findAllGrants({
      search,
      personId,
      schoolId,
      funderName,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Public()
  @Get('grants/:id')
  findOneGrant(@Param('id') id: string) {
    return this.researchService.findOneGrant(id);
  }

  @Public()
  @Get('scholar/:slug')
  getScholarProfile(@Param('slug') slug: string) {
    return this.researchService.getScholarProfile(slug);
  }

  @Public()
  @Get('publications/:id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    if (isUuid) {
      return this.researchService.findOne(id);
    }
    // Public pages and clients often pass slug on this path.
    return this.researchService.findOneBySlug(id, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Post('publications')
  create(@Body() data: any) {
    return this.researchService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Patch('publications/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.researchService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Post('seed')
  seedResearchData() {
    return this.researchService.seedResearchData();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Delete('publications/:id')
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }

  // --- Partners ---
  @Public()
  @Get('partners')
  findAllPartners(
    @Query('schoolId') schoolId?: string,
    @Query('school') schoolSlug?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.researchService.findAllPartners({
      schoolId,
      schoolSlug,
      type,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Public()
  @Get('partners/:id')
  findOnePartner(@Param('id') id: string) {
    return this.researchService.findOnePartner(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Post('partners')
  createPartner(@Body() data: any) {
    return this.researchService.createPartner(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Patch('partners/:id')
  updatePartner(@Param('id') id: string, @Body() data: any) {
    return this.researchService.updatePartner(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('programmes.manage')
  @Delete('partners/:id')
  removePartner(@Param('id') id: string) {
    return this.researchService.removePartner(id);
  }
}
