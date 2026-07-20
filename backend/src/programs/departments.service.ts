import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async findAll(query: any = {}) {
    const { schoolSlug, schoolId, q, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.school', 'school')
      .leftJoinAndSelect('department.staff', 'staff')
      .leftJoinAndSelect('department.programs', 'programs');

    if (schoolId) {
      queryBuilder.andWhere('department.schoolId = :schoolId', { schoolId });
    }

    if (schoolSlug) {
      queryBuilder.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    if (q) {
      queryBuilder.andWhere('department.name ILIKE :q', { q: `%${q}%` });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async create(data: any) {
    const { schoolId, ...rest } = data;
    if (!rest.slug && rest.name) {
      rest.slug = rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const department = this.departmentRepository.create(
      rest as Partial<Department>,
    );
    if (schoolId) {
      department.school = { id: schoolId } as any;
    }
    return this.departmentRepository.save(department);
  }

  async update(id: string, data: any) {
    const { schoolId, ...rest } = data;
    const department = await this.findOne(id);
    if (!rest.slug && rest.name) {
      rest.slug = rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    Object.assign(department, rest);
    if (schoolId) {
      department.school = { id: schoolId } as any;
    } else if (schoolId === null) {
      department.school = null as any;
    }
    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    return this.departmentRepository.softRemove(department);
  }
}
