import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/permissions.decorator';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @RequirePermission('roles.view')
  async findAllRoles() {
    return this.authService.findAllRoles();
  }

  @Get('permissions')
  @RequirePermission('roles.view')
  async findAllPermissions() {
    return this.authService.findAllPermissions();
  }

  @Post()
  @RequirePermission('roles.manage')
  async createRole(@Body() data: any) {
    return this.authService.createRole(data);
  }

  @Patch(':id')
  @RequirePermission('roles.manage')
  async updateRole(@Param('id') id: string, @Body() data: any) {
    return this.authService.updateRole(id, data);
  }

  @Delete(':id')
  @RequirePermission('roles.manage')
  async deleteRole(@Param('id') id: string) {
    return this.authService.deleteRole(id);
  }
}
