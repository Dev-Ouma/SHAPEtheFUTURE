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
import { IntroVideosService } from './intro-videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('intro-videos')
export class IntroVideosController {
  constructor(private readonly introVideosService: IntroVideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) {
    return this.introVideosService.create(data);
  }

  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.introVideosService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.introVideosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) {
    return this.introVideosService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.introVideosService.remove(id);
  }
}
