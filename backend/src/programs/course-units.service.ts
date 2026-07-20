import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseUnit } from './entities/course-unit.entity';

@Injectable()
export class CourseUnitsService {
  constructor(
    @InjectRepository(CourseUnit)
    private readonly courseUnitRepository: Repository<CourseUnit>,
  ) {}

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
  }) {
    const { page = 1, limit = 20, search, schoolId } = options;
    const skip = (page - 1) * limit;

    const query = this.courseUnitRepository
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.program', 'program')
      .leftJoinAndSelect('unit.school', 'school')
      .leftJoinAndSelect('unit.programmes', 'programmes')
      .orderBy('unit.unit_code', 'ASC');

    if (search) {
      const searchPattern = `%${search}%`;
      query.andWhere(
        '(unit.title ILIKE :search OR unit.unit_code ILIKE :search OR unit.department ILIKE :search)',
        { search: searchPattern },
      );
    }

    if (schoolId) {
      query.andWhere('school.id = :schoolId', { schoolId });
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const unit = await this.courseUnitRepository.findOne({
      where: { id },
      relations: ['program', 'school', 'programmes'],
    });
    if (!unit) throw new NotFoundException('Course Unit not found');
    return unit;
  }

  async findByCode(unit_code: string) {
    // Handle both space and dash in code (e.g., BDS 101 or BDS-101)
    const normalizedCode = unit_code.replace('-', ' ');
    const unit = await this.courseUnitRepository.findOne({
      where: { unit_code: normalizedCode },
      relations: ['program', 'school', 'programmes'],
    });
    if (!unit)
      throw new NotFoundException(
        `Course Unit with code ${unit_code} not found`,
      );
    return unit;
  }

  async create(createData: Partial<CourseUnit>) {
    const unit = this.courseUnitRepository.create(createData);
    return this.courseUnitRepository.save(unit);
  }

  async update(id: string, updateData: Partial<CourseUnit>) {
    const unit = await this.findById(id);
    Object.assign(unit, updateData);
    return this.courseUnitRepository.save(unit);
  }

  async remove(id: string) {
    const unit = await this.findById(id);
    return this.courseUnitRepository.softRemove(unit);
  }
}
