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
import { TrainingService } from './training.service';
import { LibraryWorkshop } from './library-workshop.entity';
import { LibraryTutorial } from './library-tutorial.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('library/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Public()
  @Get('workshops')
  async findAllWorkshops() {
    return this.trainingService.findAllWorkshops('Published');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('workshops/admin')
  async findAllWorkshopsAdmin(@Query('status') status?: string) {
    return this.trainingService.findAllWorkshops(status || 'all');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('workshops/:id')
  async findOneWorkshop(@Param('id') id: string) {
    return this.trainingService.findOneWorkshop(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post('workshops')
  async createWorkshop(@Body() data: Partial<LibraryWorkshop>) {
    return this.trainingService.createWorkshop(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Patch('workshops/:id')
  async updateWorkshop(
    @Param('id') id: string,
    @Body() data: Partial<LibraryWorkshop>,
  ) {
    return this.trainingService.updateWorkshop(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete('workshops/:id')
  async removeWorkshop(@Param('id') id: string) {
    return this.trainingService.removeWorkshop(id);
  }

  @Public()
  @Get('tutorials')
  async findAllTutorials() {
    return this.trainingService.findAllTutorials('Published');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('tutorials/admin')
  async findAllTutorialsAdmin(@Query('status') status?: string) {
    return this.trainingService.findAllTutorials(status || 'all');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('tutorials/:id')
  async findOneTutorial(@Param('id') id: string) {
    return this.trainingService.findOneTutorial(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post('tutorials')
  async createTutorial(@Body() data: Partial<LibraryTutorial>) {
    return this.trainingService.createTutorial(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Patch('tutorials/:id')
  async updateTutorial(
    @Param('id') id: string,
    @Body() data: Partial<LibraryTutorial>,
  ) {
    return this.trainingService.updateTutorial(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete('tutorials/:id')
  async removeTutorial(@Param('id') id: string) {
    return this.trainingService.removeTutorial(id);
  }
}
