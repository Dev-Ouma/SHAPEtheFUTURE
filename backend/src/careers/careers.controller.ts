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
} from '@nestjs/common';
import { CareersService } from './careers.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  // ==========================================
  // Public Taxonomy Routes
  // ==========================================
  @Public()
  @Get('taxonomies/divisions')
  getDivisions() {
    return this.careersService.getDivisions();
  }

  @Public()
  @Get('taxonomies/categories')
  getCategories() {
    return this.careersService.getCategories();
  }

  @Public()
  @Get('taxonomies/specializations')
  getSpecializations() {
    return this.careersService.getSpecializations();
  }

  // ==========================================
  // Public Jobs
  // ==========================================
  @Public()
  @Get()
  findAllPublic(@Query() query: any) {
    return this.careersService.findAllPublic(query);
  }

  @Public()
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.careersService.findOneBySlug(slug, locale);
  }

  // ==========================================
  // Protected Admin Routes (JWT required; @Public removed)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllAdmin(@Query() query: any) {
    return this.careersService.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.careersService.createJob(createJobDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.careersService.updateJob(id, updateJobDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careersService.deleteJob(id);
  }
}
