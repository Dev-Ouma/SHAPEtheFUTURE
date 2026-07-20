import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryWorkshop } from './library-workshop.entity';
import { LibraryTutorial } from './library-tutorial.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(LibraryWorkshop)
    private readonly workshopRepository: Repository<LibraryWorkshop>,
    @InjectRepository(LibraryTutorial)
    private readonly tutorialRepository: Repository<LibraryTutorial>,
  ) {}

  // Workshops
  async findAllWorkshops(status: string = 'Published') {
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    return this.workshopRepository.find({
      where,
      order: { date: 'ASC' },
    });
  }

  async findOneWorkshop(id: string) {
    return this.workshopRepository.findOne({ where: { id } });
  }

  async createWorkshop(data: Partial<LibraryWorkshop>) {
    const workshop = this.workshopRepository.create(data);
    return this.workshopRepository.save(workshop);
  }

  async updateWorkshop(id: string, data: Partial<LibraryWorkshop>) {
    await this.workshopRepository.update(id, data);
    return this.workshopRepository.findOne({ where: { id } });
  }

  async removeWorkshop(id: string) {
    return this.workshopRepository.delete(id);
  }

  // Tutorials
  async findAllTutorials(status: string = 'Published') {
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    return this.tutorialRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOneTutorial(id: string) {
    return this.tutorialRepository.findOne({ where: { id } });
  }

  async createTutorial(data: Partial<LibraryTutorial>) {
    const tutorial = this.tutorialRepository.create(data);
    return this.tutorialRepository.save(tutorial);
  }

  async updateTutorial(id: string, data: Partial<LibraryTutorial>) {
    await this.tutorialRepository.update(id, data);
    return this.tutorialRepository.findOne({ where: { id } });
  }

  async removeTutorial(id: string) {
    return this.tutorialRepository.delete(id);
  }
}
