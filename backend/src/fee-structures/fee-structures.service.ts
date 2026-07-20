import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeStructure } from './entities/fee-structure.entity';
import { AcademicYear } from './entities/academic-year.entity';
import { ProgrammeFee } from './entities/programme-fee.entity';

@Injectable()
export class FeeStructuresService {
  constructor(
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepository: Repository<FeeStructure>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepo: Repository<AcademicYear>,
    @InjectRepository(ProgrammeFee)
    private readonly programmeFeeRepo: Repository<ProgrammeFee>,
  ) {}

  async create(
    createFeeStructureDto: Partial<FeeStructure>,
  ): Promise<FeeStructure> {
    const feeStructure = this.feeStructureRepository.create(
      createFeeStructureDto,
    );
    return await this.feeStructureRepository.save(feeStructure);
  }

  async findAllPublic(): Promise<FeeStructure[]> {
    return await this.feeStructureRepository.find({
      where: { is_active: true },
      order: { order_index: 'ASC', created_at: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<FeeStructure[]> {
    return await this.feeStructureRepository.find({
      order: { order_index: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FeeStructure> {
    const feeStructure = await this.feeStructureRepository.findOne({
      where: { id },
    });
    if (!feeStructure) {
      throw new NotFoundException(`FeeStructure #${id} not found`);
    }
    return feeStructure;
  }

  async update(
    id: string,
    updateFeeStructureDto: Partial<FeeStructure>,
  ): Promise<FeeStructure> {
    const feeStructure = await this.findOne(id);
    Object.assign(feeStructure, updateFeeStructureDto);
    return await this.feeStructureRepository.save(feeStructure);
  }

  async remove(id: string): Promise<void> {
    const feeStructure = await this.findOne(id);
    await this.feeStructureRepository.remove(feeStructure);
  }

  // --- Academic Years ---
  async getAcademicYears(
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 10, search } = options;
    const query = this.academicYearRepo.createQueryBuilder('ay');

    if (search) {
      query.andWhere('LOWER(ay.year_range) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    query.orderBy('ay.year_range', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAcademicYearById(id: string) {
    const year = await this.academicYearRepo.findOne({ where: { id } });
    if (!year) throw new NotFoundException('Academic year not found');
    return year;
  }

  async createAcademicYear(data: Partial<AcademicYear>) {
    if (data.is_current) {
      await this.academicYearRepo.update({}, { is_current: false });
    }
    const year = this.academicYearRepo.create(data);
    return this.academicYearRepo.save(year);
  }

  async updateAcademicYear(id: string, data: Partial<AcademicYear>) {
    const year = await this.getAcademicYearById(id);
    if (data.is_current && !year.is_current) {
      await this.academicYearRepo.update({}, { is_current: false });
    }
    Object.assign(year, data);
    return this.academicYearRepo.save(year);
  }

  async deleteAcademicYear(id: string) {
    return this.academicYearRepo.delete(id);
  }

  // --- Programme Fees ---
  async getProgrammeFees(
    options: {
      academicYearId?: string;
      page?: number;
      limit?: number;
      search?: string;
      level?: string;
      school?: string;
      isAdmin?: boolean;
    } = {},
  ) {
    const {
      academicYearId,
      page = 1,
      limit = 10,
      search,
      level,
      school,
      isAdmin = false,
    } = options;
    const query = this.programmeFeeRepo
      .createQueryBuilder('pf')
      .leftJoinAndSelect('pf.program', 'program')
      .leftJoinAndSelect('program.school', 'school')
      .leftJoinAndSelect('pf.academic_year', 'academic_year')
      .where('pf.is_active = :active', { active: true });

    // Public access: only show fees for PUBLISHED programmes
    if (!isAdmin) {
      query.andWhere('program.status = :pubStatus', { pubStatus: 'PUBLISHED' });
      query.andWhere('program.is_published = :isPub', { isPub: true });
    }

    if (academicYearId) {
      query.andWhere('pf.academic_year_id = :id', { id: academicYearId });
    }

    if (level) {
      query.andWhere('program.level = :level', { level });
    }

    if (school) {
      query.andWhere('school.name = :school', { school });
    }

    if (search) {
      query.andWhere(
        '(LOWER(program.title) LIKE :search OR LOWER(program.programme_code) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Always sort by newest first or alphabetical
    query.orderBy('pf.created_at', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProgrammeFeeByProgram(programId: string) {
    return this.programmeFeeRepo.findOne({
      where: { program: { id: programId } },
      order: { created_at: 'DESC' },
    });
  }

  async deleteProgrammeFee(id: string) {
    return this.programmeFeeRepo.delete(id);
  }

  async getProgrammeFeeFilters() {
    // Only show filters from PUBLISHED programmes on the public-facing fee page
    const fees = await this.programmeFeeRepo
      .createQueryBuilder('pf')
      .leftJoinAndSelect('pf.program', 'program')
      .leftJoinAndSelect('program.school', 'school')
      .where('pf.is_active = :active', { active: true })
      .andWhere('program.status = :status', { status: 'PUBLISHED' })
      .andWhere('program.is_published = :isPub', { isPub: true })
      .getMany();

    const schools = Array.from(
      new Set(fees.map((f) => f.program?.school?.name).filter(Boolean)),
    );
    const levels = Array.from(
      new Set(fees.map((f) => f.program?.level).filter(Boolean)),
    );

    return { schools, levels };
  }

  async getProgrammeFeeById(id: string) {
    return this.programmeFeeRepo.findOne({
      where: { id },
    });
  }

  async saveProgrammeFee(data: Partial<ProgrammeFee>) {
    // Basic upsert or create depending on whether ID is passed
    if (data.id) {
      const existing = await this.programmeFeeRepo.findOne({
        where: { id: data.id },
      });
      if (existing) {
        Object.assign(existing, data);
        return this.programmeFeeRepo.save(existing);
      }
    }
    const pf = this.programmeFeeRepo.create(data);
    return this.programmeFeeRepo.save(pf);
  }
}
