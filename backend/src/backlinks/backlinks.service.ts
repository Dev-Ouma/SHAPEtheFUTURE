import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BackLink,
  Partner,
  PartnerCategory,
  PartnershipProject,
} from './entities/backlink.entity';

@Injectable()
export class BackLinksService {
  constructor(
    @InjectRepository(BackLink)
    private readonly backLinkRepository: Repository<BackLink>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(PartnerCategory)
    private readonly categoryRepository: Repository<PartnerCategory>,
    @InjectRepository(PartnershipProject)
    private readonly projectRepository: Repository<PartnershipProject>,
  ) {}

  // --- LEGACY METHODS (Transition Period) ---
  async findAll() {
    return this.backLinkRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
    });
  }

  // --- NEW PARTNERSHIP METHODS ---

  async findAllPartners(
    options: { featured?: boolean; category?: string } = {},
  ) {
    const query = this.partnerRepository
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.category', 'category')
      .where('partner.is_active = :isActive', { isActive: true });

    if (options.featured) {
      query.andWhere('partner.is_featured = :featured', { featured: true });
    }

    if (options.category) {
      query.andWhere('category.slug = :categorySlug', {
        categorySlug: options.category,
      });
    }

    return query.orderBy('partner.order', 'ASC').getMany();
  }

  async findPartnerBySlug(slug: string) {
    const partner = await this.partnerRepository.findOne({
      where: { slug, is_active: true },
      relations: ['category', 'projects'],
    });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async findPartnerById(id: number) {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['category', 'projects'],
    });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async findAllCategories() {
    return this.categoryRepository.find({
      relations: ['partners'],
      order: { name: 'ASC' },
    });
  }

  async getStats() {
    const totalPartners = await this.partnerRepository.count({
      where: { is_active: true },
    });
    const featuredPartners = await this.partnerRepository.count({
      where: { is_featured: true, is_active: true },
    });
    const totalProjects = await this.projectRepository.count();

    // Hardcoded metric for countries as per proposal, can be dynamic later
    return {
      activePartners: totalPartners,
      featuredPartners,
      jointProjects: totalProjects,
      countriesReached: 12,
    };
  }

  // --- ADMIN METHODS ---

  async findAllAdmin() {
    return this.partnerRepository.find({
      relations: ['category'],
      order: { order: 'ASC' },
    });
  }

  async createPartner(data: Partial<Partner>) {
    const partner = this.partnerRepository.create(data);
    return this.partnerRepository.save(partner);
  }

  async updatePartner(id: number, data: Partial<Partner>) {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    Object.assign(partner, data);
    return this.partnerRepository.save(partner);
  }

  async removePartner(id: number) {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return this.partnerRepository.remove(partner);
  }

  // --- SEEDING HELPERS ---
  async ensureCategory(name: string, slug: string) {
    let category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) {
      category = this.categoryRepository.create({ name, slug });
      await this.categoryRepository.save(category);
    }
    return category;
  }
}
