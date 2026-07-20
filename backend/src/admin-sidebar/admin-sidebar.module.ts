import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSidebarService } from './admin-sidebar.service';
import { AdminSidebarController } from './admin-sidebar.controller';
import {
  AdminSidebarCategory,
  AdminSidebarItem,
} from './entities/admin-sidebar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminSidebarCategory, AdminSidebarItem])],
  controllers: [AdminSidebarController],
  providers: [AdminSidebarService],
  exports: [AdminSidebarService],
})
export class AdminSidebarModule {}
