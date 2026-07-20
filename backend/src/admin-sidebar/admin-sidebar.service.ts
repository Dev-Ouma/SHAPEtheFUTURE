import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminSidebarCategory,
  AdminSidebarItem,
} from './entities/admin-sidebar.entity';

@Injectable()
export class AdminSidebarService {
  constructor(
    @InjectRepository(AdminSidebarCategory)
    private readonly categoryRepository: Repository<AdminSidebarCategory>,
    @InjectRepository(AdminSidebarItem)
    private readonly itemRepository: Repository<AdminSidebarItem>,
  ) {}

  async getSidebar() {
    return this.categoryRepository.find({
      relations: ['items'],
      order: {
        order: 'ASC',
        items: {
          order: 'ASC',
        },
      },
    });
  }

  async createCategory(data: any) {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, data: any) {
    await this.categoryRepository.update(id, data);
    return this.categoryRepository.findOneBy({ id });
  }

  async deleteCategory(id: string) {
    return this.categoryRepository.delete(id);
  }

  async createItem(data: any) {
    const item = this.itemRepository.create(data);
    return this.itemRepository.save(item);
  }

  async updateItem(id: string, data: any) {
    await this.itemRepository.update(id, data);
    return this.itemRepository.findOneBy({ id });
  }

  async deleteItem(id: string) {
    return this.itemRepository.delete(id);
  }
}
