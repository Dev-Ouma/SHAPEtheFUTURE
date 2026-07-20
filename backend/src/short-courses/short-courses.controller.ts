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
} from '@nestjs/common';
import { ShortCoursesService } from './short-courses.service';
import {
  CreateShortCourseDto,
  UpdateShortCourseDto,
} from './dto/short-course.dto';

@Controller('short-courses')
export class ShortCoursesController {
  constructor(private readonly shortCoursesService: ShortCoursesService) {}

  @Public()
  @Get()
  findAll(@Query() filters: any) {
    return this.shortCoursesService.findAll(filters);
  }

  @Public()
  @Get('taxonomies/departments')
  getDepartments() {
    return this.shortCoursesService.getDepartments();
  }

  @Public()
  @Get('taxonomies/categories')
  getCategories() {
    return this.shortCoursesService.getCategories();
  }

  @Public()
  @Get('taxonomies/methods')
  getMethods() {
    return this.shortCoursesService.getLearningMethods();
  }

  @Post('taxonomies/categories')
  createCategory(@Body() data: any) {
    return this.shortCoursesService.createCategory(data);
  }

  @Post('taxonomies/methods')
  createMethod(@Body() data: any) {
    return this.shortCoursesService.createLearningMethod(data);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.shortCoursesService.findBySlug(slug, locale);
  }

  @Public()
  @Get('lookup/:code')
  findByCode(@Param('code') code: string, @Query('locale') locale?: string) {
    return this.shortCoursesService.findByCode(code, locale);
  }

  @Public()
  @Get(':id/related')
  getRelated(@Param('id') id: string) {
    return this.shortCoursesService.getRelatedCourses(id);
  }

  @Public()
  @Get(':id/related-programmes')
  getRelatedProgrammes(@Param('id') id: string) {
    return this.shortCoursesService.getRelatedProgrammes(id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    // Standard ID lookup might be needed by admin
    return this.shortCoursesService.findByCode(id); // Simple fallback for now
  }

  @Post()
  create(@Body() createDto: CreateShortCourseDto) {
    return this.shortCoursesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateShortCourseDto) {
    return this.shortCoursesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shortCoursesService.remove(id);
  }
}
