import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolResource } from './entities/resource.entity';
import { School } from './entities/school.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('school-resources')
export class SchoolResourcesController {
  constructor(
    @InjectRepository(SchoolResource)
    private readonly resourceRepo: Repository<SchoolResource>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  @Get()
  async findAll(
    @Query('school') schoolSlug?: string,
    @Query('schoolId') schoolId?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (schoolId) {
      where.school = { id: schoolId };
    } else if (schoolSlug) {
      const school = await this.schoolRepo.findOne({
        where: { slug: schoolSlug },
      });
      if (!school) return { data: [], total: 0, page, limit, totalPages: 0 };
      where.school = { id: school.id };
    }

    if (category && category !== 'All Resources') {
      where.category = category;
    }

    if (search) {
      const { ILike } = require('typeorm');
      where = [
        { ...where, title: ILike(`%${search}%`) },
        { ...where, description: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.resourceRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() data: any) {
    const school = await this.schoolRepo.findOne({
      where: { id: data.schoolId },
    });
    const resource = this.resourceRepo.create({
      ...data,
      school,
    });
    return this.resourceRepo.save(resource);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.resourceRepo.update(id, data);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async importFromSchool(
    @Body() data: { fromSchoolSlug: string; toSchoolId: string },
  ) {
    const fromSchool = await this.schoolRepo.findOne({
      where: { slug: data.fromSchoolSlug },
    });
    const toSchool = await this.schoolRepo.findOne({
      where: { id: data.toSchoolId },
    });

    if (!fromSchool || !toSchool)
      return { success: false, message: 'Source or target school not found' };

    const sourceResources = await this.resourceRepo.find({
      where: { school: { id: fromSchool.id } },
    });

    const newResources = sourceResources.map((resource) => {
      const { id, created_at, updated_at, ...resourceData } = resource;
      return this.resourceRepo.create({
        ...resourceData,
        school: toSchool,
      });
    });

    await this.resourceRepo.save(newResources);
    return { success: true, count: newResources.length };
  }

  @Post('seed/:schoolId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seedForSchool(@Param('schoolId') schoolId: string) {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) return { success: false, message: 'School not found' };

    const resources = [
      {
        title: 'Academic Integrity Guidelines',
        description:
          'Official OUK policy on academic honesty, citation standards, and plagiarism prevention.',
        type: 'PDF',
        category: 'Faculty Policies',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/policies/academic-integrity.pdf',
        file_size: '1.2 MB',
      },
      {
        title: 'Research Proposal Framework 2026',
        description:
          'Standardized template for undergraduate and postgraduate research submissions.',
        type: 'DOCX',
        category: 'Research Templates',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/templates/research-framework.docx',
        file_size: '850 KB',
      },
      {
        title: 'Semester Study Planner',
        description:
          'Time management tool customized for faculty-specific course loads.',
        type: 'PDF',
        category: 'Learning Guides',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/guides/study-planner.pdf',
        file_size: '450 KB',
      },
      {
        title: 'Faculty Grading Policy',
        description:
          'Detailed breakdown of assessment rubrics and institutional grading scales.',
        type: 'PDF',
        category: 'Faculty Policies',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/policies/grading-policy.pdf',
        file_size: '2.1 MB',
      },
    ];

    const seeded = [];
    for (const resData of resources) {
      const exists = await this.resourceRepo.findOne({
        where: { title: resData.title, school: { id: school.id } },
      });
      if (!exists) {
        const resource = this.resourceRepo.create({ ...resData, school });
        await this.resourceRepo.save(resource);
        seeded.push(resource);
      }
    }

    return { success: true, count: seeded.length };
  }

  @Delete('clear/:schoolId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async clearSchoolResources(@Param('schoolId') schoolId: string) {
    await this.resourceRepo.delete({ school: { id: schoolId } });
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.resourceRepo.delete(id);
  }
}
