import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FeeStructuresService } from './fee-structures.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fee-structures')
export class FeeStructuresController {
  constructor(private readonly feeStructuresService: FeeStructuresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFeeStructureDto: any) {
    return this.feeStructuresService.create(createFeeStructureDto);
  }

  @Public()
  @Get('public')
  findAllPublic() {
    return this.feeStructuresService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.feeStructuresService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feeStructuresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateFeeStructureDto: any) {
    return this.feeStructuresService.update(id, updateFeeStructureDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.feeStructuresService.remove(id);
  }

  // --- Academic Years ---
  @Public()
  @Get('academic-years/list')
  getAcademicYears(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.feeStructuresService.getAcademicYears({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get('academic-years/:id')
  @UseGuards(JwtAuthGuard)
  getAcademicYear(@Param('id') id: string) {
    return this.feeStructuresService.getAcademicYearById(id);
  }

  @Post('academic-years/create')
  @UseGuards(JwtAuthGuard)
  createAcademicYear(@Body() body: any) {
    if (body.id) {
      return this.feeStructuresService.updateAcademicYear(body.id, body);
    }
    return this.feeStructuresService.createAcademicYear(body);
  }

  @Delete('academic-years/:id')
  @UseGuards(JwtAuthGuard)
  deleteAcademicYear(@Param('id') id: string) {
    return this.feeStructuresService.deleteAcademicYear(id);
  }
  @Public()
  @Get('programme-fees/list')
  getProgrammeFees(@Query() query: any) {
    return this.feeStructuresService.getProgrammeFees({
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      search: query.search,
      level: query.level,
      school: query.school,
      academicYearId: query.academicYearId,
      isAdmin: false, // Public endpoint — enforce PUBLISHED-only
    });
  }

  @Public()
  @Get('programme-fees/filters')
  getProgrammeFeeFilters() {
    return this.feeStructuresService.getProgrammeFeeFilters();
  }

  @Public()
  @Get('programme-fees/program/:id')
  getProgrammeFeeByProgram(@Param('id') programId: string) {
    return this.feeStructuresService.getProgrammeFeeByProgram(programId);
  }

  @Public()
  @Get('programme-fees/single/:id')
  getProgrammeFeeById(@Param('id') id: string) {
    return this.feeStructuresService.getProgrammeFeeById(id);
  }

  @Post('programme-fees/save')
  @UseGuards(JwtAuthGuard)
  saveProgrammeFee(@Body() body: any) {
    return this.feeStructuresService.saveProgrammeFee(body);
  }
}
