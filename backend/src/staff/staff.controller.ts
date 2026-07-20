import { Public } from '../common/decorators/public.decorator';
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
  NotFoundException,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrcidService } from '../research-integration/orcid.service';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly orcidService: OrcidService,
  ) {
    console.log('--- [DIAGNOSTIC] StaffController Constructor Executed ---');
  }

  @Public()
  @Get('ping')
  ping() {
    return {
      status: 'alive',
      module: 'StaffController',
      timestamp: new Date(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createStaffDto: any) {
    return this.staffService.create(createStaffDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: any) {
    const options = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      executive_type: query.executive_type,
      staff_type: query.staff_type,
      department: query.department,
      schoolSlug: query.schoolSlug || query.school,
    };
    return this.staffService.findAll(options);
  }

  @Public()
  @Get('executive-types')
  findAllExecutiveTypes() {
    return this.staffService.findAllExecutiveTypes();
  }

  @Public()
  @Get('staff-types')
  findAllStaffTypes() {
    return this.staffService.findAllStaffTypes();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    // Determine if slug or ID
    if (id.length === 36 && id.includes('-')) {
      return this.staffService.findOne(id);
    }
    return this.staffService.findBySlug(id);
  }

  /**
   * Fetches a live researcher profile enriched with ORCID data.
   * Works for any staff member with an orcid_id set on their profile.
   */
  @Public()
  @Get(':id/orcid')
  async getOrcidProfile(@Param('id') id: string) {
    const staff =
      (await this.staffService.findOne(id).catch(() => null)) ||
      (await this.staffService.findBySlug(id).catch(() => null));
    if (!staff || !staff.orcid_id) {
      throw new NotFoundException(
        'No ORCID ID configured for this researcher.',
      );
    }
    const [profile, works] = await Promise.all([
      this.orcidService.getScholarProfile(staff.orcid_id),
      this.orcidService.getScholarWorks(staff.orcid_id),
    ]);
    return { staff, orcidProfile: profile, publications: works };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: any) {
    return this.staffService.update(id, updateStaffDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
