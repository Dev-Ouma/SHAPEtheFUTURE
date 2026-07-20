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
import { DatabasesService } from './databases.service';
import { LibraryDatabase, DatabaseCategory } from './library-database.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('library/databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Public()
  @Get()
  async findAll(@Query('category') category?: DatabaseCategory) {
    return this.databasesService.findAll(category, 'Published');
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['knowledge_hub.view', 'knowledge_hub.manage'])
  @Get('admin')
  async findAllAdmin(
    @Query('category') category?: DatabaseCategory,
    @Query('status') status?: string,
  ) {
    return this.databasesService.findAll(category, status || 'all');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.databasesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Post()
  async create(@Body() data: Partial<LibraryDatabase>) {
    return this.databasesService.create(data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<LibraryDatabase>,
  ) {
    return this.databasesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.databasesService.remove(id);
  }
}
