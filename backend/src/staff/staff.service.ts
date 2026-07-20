import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StaffMember } from './entities/staff-member.entity';
import { ExecutiveType } from './entities/executive-type.entity';
import { StaffType } from './entities/staff-type.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
    @InjectRepository(ExecutiveType)
    private readonly executiveTypeRepository: Repository<ExecutiveType>,
    @InjectRepository(StaffType)
    private readonly staffTypeRepository: Repository<StaffType>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createData: any): Promise<StaffMember> {
    if (createData.email) {
      const userCheck = await this.dataSource.query(
        'SELECT full_name FROM users WHERE email = $1',
        [createData.email],
      );
      if (userCheck.length > 0) {
        if (
          userCheck[0].full_name.trim().toLowerCase() !==
          createData.full_name.trim().toLowerCase()
        ) {
          throw new ConflictException(
            `Email ${createData.email} is already associated with a different user. Please use the exact same full name as the user profile, or use a different email.`,
          );
        }
      }
    }

    const member = this.staffRepository.create(
      createData as Partial<StaffMember>,
    );
    return this.staffRepository.save(member);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    executive_type?: string;
    staff_type?: string;
    department?: string;
    schoolSlug?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      executive_type,
      staff_type,
      department,
      schoolSlug,
    } = options;
    const skip = (page - 1) * limit;

    const query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.executive_types', 'executive_types')
      .leftJoinAndSelect('staff.staff_type', 'staff_type')
      .leftJoinAndSelect('staff.department', 'department')
      .leftJoinAndSelect('staff.school', 'school')
      .where('staff.deleted_at IS NULL')
      .skip(skip)
      .take(limit);

    if (search) {
      query.andWhere(
        '(staff.full_name ILIKE :search OR staff.job_title ILIKE :search OR staff.designation ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (executive_type) {
      if (executive_type.length === 36) {
        query.andWhere('executive_types.id = :executiveTypeId', {
          executiveTypeId: executive_type,
        });
      } else {
        query.andWhere('executive_types.name = :executiveType', {
          executiveType: executive_type,
        });
      }
    }

    if (staff_type) {
      if (staff_type.length === 36) {
        query.andWhere('staff_type.id = :staffType', { staffType: staff_type });
      } else {
        query.andWhere('staff_type.name = :staffType', {
          staffType: staff_type,
        });
      }
    }

    if (department) {
      query.andWhere('department.id = :departmentId', {
        departmentId: department,
      });
    }

    if (schoolSlug) {
      query.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    query.orderBy('staff.display_order', 'ASC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllExecutiveTypes(): Promise<ExecutiveType[]> {
    return this.executiveTypeRepository.find();
  }

  async findAllStaffTypes(): Promise<StaffType[]> {
    return this.staffTypeRepository.find();
  }

  async findOne(id: string): Promise<StaffMember> {
    const member = await this.staffRepository.findOne({
      where: { id },
      relations: ['executive_types', 'staff_type', 'department', 'school'],
    });

    if (!member) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }
    return member;
  }

  async findBySlug(profile_slug: string): Promise<StaffMember> {
    const member = await this.staffRepository.findOne({
      where: { profile_slug },
      relations: ['executive_types', 'staff_type', 'department', 'school'],
    });

    if (!member) {
      throw new NotFoundException(
        `Staff member with URL ${profile_slug} not found`,
      );
    }
    return member;
  }

  async update(id: string, updateData: any): Promise<StaffMember> {
    const member = await this.findOne(id);

    // Check if email or name is changing, and enforce consistency with users table
    const targetEmail = updateData.email || member.email;
    const targetName = updateData.full_name || member.full_name;

    if (
      (updateData.email && updateData.email !== member.email) ||
      (updateData.full_name && updateData.full_name !== member.full_name)
    ) {
      if (targetEmail) {
        const userCheck = await this.dataSource.query(
          'SELECT full_name FROM users WHERE email = $1',
          [targetEmail],
        );
        if (userCheck.length > 0) {
          if (
            userCheck[0].full_name.trim().toLowerCase() !==
            targetName.trim().toLowerCase()
          ) {
            throw new ConflictException(
              `Email ${targetEmail} is already associated with a different user. Please use the exact same full name as the user profile, or use a different email.`,
            );
          }
        }
      }
    }

    this.staffRepository.merge(member, updateData);
    return this.staffRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.staffRepository.softRemove(member);
  }
}
