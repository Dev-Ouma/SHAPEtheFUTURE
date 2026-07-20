import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { RecycleBinService } from './recycle-bin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('admin/recycle-bin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class RecycleBinController {
  constructor(private readonly recycleBinService: RecycleBinService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recycleBinService.findAllDeleted({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post(':entityName/:id/restore')
  async restore(
    @Param('entityName') entityName: string,
    @Param('id') id: string,
  ) {
    return this.recycleBinService.restore(entityName, id);
  }

  @Delete(':entityName/:id')
  async destroy(
    @Param('entityName') entityName: string,
    @Param('id') id: string,
  ) {
    return this.recycleBinService.destroy(entityName, id);
  }
}
