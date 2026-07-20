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
import { AdminSidebarService } from './admin-sidebar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin-sidebar')
export class AdminSidebarController {
  constructor(private readonly adminSidebarService: AdminSidebarService) {}

  @Get()
  getSidebar() {
    return this.adminSidebarService.getSidebar();
  }

  @Post('categories')
  createCategory(@Body() data: any) {
    return this.adminSidebarService.createCategory(data);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminSidebarService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminSidebarService.deleteCategory(id);
  }

  @Post('items')
  createItem(@Body() data: any) {
    return this.adminSidebarService.createItem(data);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() data: any) {
    return this.adminSidebarService.updateItem(id, data);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.adminSidebarService.deleteItem(id);
  }
}
