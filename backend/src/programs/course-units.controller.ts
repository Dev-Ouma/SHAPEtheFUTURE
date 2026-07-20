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
import { CourseUnitsService } from './course-units.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('course-units')
export class CourseUnitsController {
  constructor(private readonly courseUnitsService: CourseUnitsService) {}

  @Post()
  create(@Body() createData: any) {
    return this.courseUnitsService.create(createData);
  }

  @Public()
  @Get()
  findAll(@Query() query: any) {
    const options = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      schoolId: query.schoolId,
    };
    return this.courseUnitsService.findAll(options);
  }

  @Public()
  @Get('lookup/:code')
  findByCode(@Param('code') code: string) {
    console.log(`[Institutional Registry] Unit Lookup Triggered: ${code}`);
    return this.courseUnitsService.findByCode(code);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseUnitsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.courseUnitsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseUnitsService.remove(id);
  }
}
