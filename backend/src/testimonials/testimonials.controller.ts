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
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Public()
  @Get()
  findAll(@Query('locale') locale?: string) {
    return this.testimonialsService.findAll(locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['testimonials.view', 'testimonials.manage'])
  @Get('admin')
  findAllAdmin() {
    return this.testimonialsService.findAllAdmin();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.testimonialsService.findOne(id, locale);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('testimonials.manage')
  @Post()
  create(@Body() data: any) {
    return this.testimonialsService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('testimonials.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.testimonialsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('testimonials.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
