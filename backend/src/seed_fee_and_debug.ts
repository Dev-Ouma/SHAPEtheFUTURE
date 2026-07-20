import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Program } from './programs/entities/program.entity';
import { ProgrammeFee } from './fee-structures/entities/programme-fee.entity';
import { AcademicYear } from './fee-structures/entities/academic-year.entity';
import { PublishStatus } from './common/enums/publish-status.enum';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const programRepo = dataSource.getRepository(Program);
    const feeRepo = dataSource.getRepository(ProgrammeFee);
    const yearRepo = dataSource.getRepository(AcademicYear);

    // 1. Find the BSc Business & Entrepreneurship programme
    const program = await programRepo.findOne({
      where: { slug: 'bsc-business-and-entrepreneurship' },
    });

    if (!program) {
      console.error('Programme not found! Make sure the slug is correct.');
      // Try to find by title
      const all = await programRepo.find({
        select: ['id', 'title', 'slug', 'status'],
      });
      console.log(
        'Available programmes:',
        JSON.stringify(
          all.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
          })),
          null,
          2,
        ),
      );
      return;
    }
    console.log(
      `Found programme: "${program.title}" (status: ${program.status})`,
    );

    // 2. Find or create the current academic year
    let academicYear = await yearRepo.findOne({ where: { is_current: true } });
    if (!academicYear) {
      console.log('No current academic year found. Creating 2025/2026...');
      academicYear = yearRepo.create({
        year_range: '2025/2026',
        is_current: true,
        is_published: true,
      });
      academicYear = await yearRepo.save(academicYear);
    }
    console.log(`Using academic year: ${academicYear.year_range}`);

    // 3. Check if fee already exists for this programme
    const existing = await feeRepo.findOne({
      where: {
        program: { id: program.id },
        academic_year: { id: academicYear.id },
      },
    });

    if (existing) {
      console.log(`Fee structure already exists. Updating to 105,000...`);
      existing.tuition_fee = 105000;
      existing.currency = 'KES';
      existing.is_active = true;
      await feeRepo.save(existing);
      console.log(`Fee updated! ID: ${existing.id}`);
    } else {
      console.log('Creating new fee structure at KES 105,000/year...');
      const fee = feeRepo.create({
        program: { id: program.id },
        academic_year: { id: academicYear.id },
        tuition_fee: 105000,
        currency: 'KES',
        is_active: true,
        other_fees: [],
      });
      const saved = await feeRepo.save(fee);
      console.log(`Fee structure created! ID: ${saved.id}`);
    }

    // 4. Check the governance pending list
    console.log('\n--- Debugging Governance Pending ---');
    const pendingPrograms = await programRepo.find({
      where: { status: PublishStatus.REVIEW },
      select: ['id', 'title', 'slug', 'status'],
    });
    console.log(
      'Programs in REVIEW status:',
      JSON.stringify(pendingPrograms, null, 2),
    );

    // 5. Check what permissions the 'content.manage' and 'content.approve' permissions are
    const permQuery = await dataSource.query(`
      SELECT p.id, p.slug, p.name 
      FROM permissions p 
      WHERE p.slug IN ('content.manage', 'content.approve')
    `);
    console.log('\nPermission config:', JSON.stringify(permQuery, null, 2));

    // 6. Check if the super admin has these permissions
    const adminPermQuery = await dataSource.query(`
      SELECT u.email, p.slug as permission
      FROM users u
      JOIN user_roles ur ON ur."usersId" = u.id
      JOIN roles r ON r.id = ur."rolesId"
      JOIN role_permissions rp ON rp."rolesId" = r.id
      JOIN permissions p ON p.id = rp."permissionsId"
      WHERE u.email = 'admin@ouk.ac.ke'
      AND p.slug IN ('content.manage', 'content.approve')
    `);
    console.log(
      '\nAdmin permissions for governance:',
      JSON.stringify(adminPermQuery, null, 2),
    );
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await app.close();
  }
}

run();
