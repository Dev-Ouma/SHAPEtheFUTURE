import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { Program } from './programs/entities/program.entity';
import { CourseUnit } from './programs/entities/course-unit.entity';
import { School } from './programs/entities/school.entity';
import { User } from './auth/entities/user.entity';
import { PublishStatus } from './common/enums/publish-status.enum';

async function uploadProgramme() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const rawData = fs.readFileSync(
      '/Users/mwarabu/Downloads/bsc-business-and-entrepreneurship.json',
      'utf8',
    );
    const data = JSON.parse(rawData);
    const progData = data.programme;
    const unitsData = data.course_units;

    const programRepo = dataSource.getRepository(Program);
    const unitRepo = dataSource.getRepository(CourseUnit);
    const schoolRepo = dataSource.getRepository(School);
    const userRepo = dataSource.getRepository(User);

    // Find the closest matching school
    let school = await schoolRepo.findOne({
      where: { slug: 'school-of-business-economics' },
    });
    if (!school) {
      school = await schoolRepo.findOne({ where: {} }); // fallback
    }

    // Assign to admin user
    const admin = await userRepo.findOne({
      where: { email: 'admin@ouk.ac.ke' },
      withDeleted: true,
    });

    console.log(`Uploading programme: ${progData.title}...`);

    // Create Program Entity
    let program = new Program();
    Object.assign(program, {
      title: progData.title,
      slug: progData.slug,
      programme_code: progData.programme_code,
      level: progData.level,
      mode_of_delivery: progData.mode_of_delivery
        ? [progData.mode_of_delivery]
        : [],
      duration: progData.duration,
      application_status: progData.application_status,
      is_featured: progData.is_featured,
      overview: progData.overview,
      entry_requirements: Array.isArray(progData.entry_requirements)
        ? progData.entry_requirements.join('\n')
        : progData.entry_requirements,
      learning_outcomes: Array.isArray(progData.learning_outcomes)
        ? progData.learning_outcomes.join('\n')
        : progData.learning_outcomes,
      programme_structure: progData.programme_structure,
      careers: progData.careers,
      assessment: progData.assessment,
      school: school,
      author: admin,
      status: PublishStatus.REVIEW, // Set to REVIEW to appear on the approvals page
    });

    // Check if it exists
    const existing = await programRepo.findOne({
      where: { slug: progData.slug },
    });
    if (existing) {
      console.log(`Deleting existing programme ${progData.slug}...`);
      await programRepo.remove(existing);
    }

    program = await programRepo.save(program);
    console.log(
      `Programme saved with ID: ${program.id} and status: ${program.status}`,
    );

    // Create Course Units
    const units = unitsData.map((u: any) => {
      const unit = new CourseUnit();
      Object.assign(unit, {
        unit_code: u.unit_code,
        title: u.title,
        credits: u.credits,
        year_level: u.year_level,
        description: u.description,
        learning_outcomes: Array.isArray(u.learning_outcomes)
          ? u.learning_outcomes.join('\n')
          : u.learning_outcomes,
        prerequisites: u.prerequisites,
        assessment_methods: u.assessment_methods,
        program: program,
      });
      return unit;
    });

    await unitRepo.save(units);
    console.log(`Successfully uploaded ${units.length} course units.`);
    console.log(`Programme is now waiting for approval in 'REVIEW' status!`);
  } catch (error) {
    console.error('Error uploading programme:', error);
  } finally {
    await app.close();
  }
}

uploadProgramme();
