import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PeerLearner } from './entities/peer-learner.entity';
import {
  CreatePeerLearnerDto,
  UpdatePeerLearnerDto,
} from './dto/peer-learner.dto';

@Injectable()
export class PeerLearnersService {
  constructor(
    @InjectRepository(PeerLearner)
    private readonly peerLearnerRepository: Repository<PeerLearner>,
  ) {}

  async create(data: CreatePeerLearnerDto) {
    const peerLearner = this.peerLearnerRepository.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      image_url: data.image_url,
      school: data.schoolId ? { id: data.schoolId } : undefined,
    });
    return this.peerLearnerRepository.save(peerLearner);
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      schoolId?: string;
      is_active?: boolean;
    } = {},
  ) {
    const { page = 1, limit = 10, search, schoolId, is_active } = options;
    const skip = (page - 1) * limit;

    const query = this.peerLearnerRepository
      .createQueryBuilder('learner')
      .leftJoinAndSelect('learner.school', 'school')
      .skip(skip)
      .take(limit)
      .orderBy('learner.created_at', 'DESC');

    if (search) {
      const searchPattern = `%${search}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('learner.name ILIKE :search', { search: searchPattern })
            .orWhere('learner.email ILIKE :search', { search: searchPattern })
            .orWhere('learner.phone ILIKE :search', { search: searchPattern });
        }),
      );
    }

    if (schoolId && schoolId !== 'undefined' && schoolId !== 'all') {
      query.andWhere('school.id = :schoolId', { schoolId });
    }

    if (is_active !== undefined) {
      query.andWhere('learner.is_active = :is_active', { is_active });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const learner = await this.peerLearnerRepository.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!learner)
      throw new NotFoundException(`Peer learner with ID ${id} not found`);
    return learner;
  }

  async update(id: string, data: UpdatePeerLearnerDto) {
    const peerLearner = await this.findOne(id);

    if (data.schoolId !== undefined) {
      // Support explicitly unsetting the school by sending null or empty string
      peerLearner.school =
        data.schoolId && data.schoolId !== ''
          ? ({ id: data.schoolId } as any)
          : null;
    }

    if (data.name !== undefined) peerLearner.name = data.name;
    if (data.phone !== undefined) peerLearner.phone = data.phone;
    if (data.email !== undefined) peerLearner.email = data.email;
    if (data.image_url !== undefined) peerLearner.image_url = data.image_url;
    if (data.is_active !== undefined) peerLearner.is_active = data.is_active;

    return this.peerLearnerRepository.save(peerLearner);
  }

  async remove(id: string) {
    const learner = await this.findOne(id);
    return this.peerLearnerRepository.softRemove(learner);
  }

  async toggleStatus(id: string) {
    const learner = await this.findOne(id);
    learner.is_active = !learner.is_active;
    return this.peerLearnerRepository.save(learner);
  }
}
