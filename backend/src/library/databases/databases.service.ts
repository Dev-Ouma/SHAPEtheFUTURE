import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryDatabase, DatabaseCategory } from './library-database.entity';

@Injectable()
export class DatabasesService {
  constructor(
    @InjectRepository(LibraryDatabase)
    private readonly databaseRepository: Repository<LibraryDatabase>,
  ) {}

  async findAll(category?: DatabaseCategory, status: string = 'Published') {
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    return this.databaseRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    return this.databaseRepository.findOne({ where: { id } });
  }

  async create(data: Partial<LibraryDatabase>) {
    const db = this.databaseRepository.create(data);
    return this.databaseRepository.save(db);
  }

  async update(id: string, data: Partial<LibraryDatabase>) {
    await this.databaseRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.databaseRepository.delete(id);
  }
}
