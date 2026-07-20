import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { AcademicYear } from './src/fee-structures/entities/academic-year.entity';
import { ProgrammeFee } from './src/fee-structures/entities/programme-fee.entity';
import { Program } from './src/programs/entities/program.entity';
import { Scholarship } from './src/finance/entities/scholarship.entity';
import { PaymentMethodInfo } from './src/finance/entities/payment-method.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const yearRepo = dataSource.getRepository(AcademicYear);
  const feeRepo = dataSource.getRepository(ProgrammeFee);
  const programRepo = dataSource.getRepository(Program);
  const scholarRepo = dataSource.getRepository(Scholarship);
  const paymentRepo = dataSource.getRepository(PaymentMethodInfo);

  // 1. Academic Year
  let year = await yearRepo.findOne({ where: { year_range: '2025/2026' } });
  if (!year) {
    year = await yearRepo.save(yearRepo.create({ year_range: '2025/2026', is_current: true, is_published: true }));
  }

  // 2. Programs
  const programs = await programRepo.find();
  
  // 3. Programme Fees
  for (const prog of programs) {
    let fee = await feeRepo.findOne({ where: { program: { id: prog.id }, academic_year: { id: year.id } } });
    if (!fee) {
      await feeRepo.save(feeRepo.create({
        program: prog,
        academic_year: year,
        tuition_fee: 120000,
        registration_fee: 5000,
        student_activity_fee: 3000,
        examination_fee: 4000,
        technology_fee: 10000,
        library_fee: 2000,
        practical_laboratory_fee: 0,
        currency: 'KES',
        is_active: true
      }));
    }
  }

  // 4. Scholarships
  if (await scholarRepo.count() === 0) {
    await scholarRepo.save(scholarRepo.create({
      title: 'OUK Vice-Chancellor Merit Scholarship',
      description: 'Awarded to top performing students across all schools.',
      amount: 50000,
      eligibility_criteria: 'Must have a GPA of 3.8 and above.',
      is_active: true
    }));
  }

  // 5. Payment Methods
  if (await paymentRepo.count() === 0) {
    await paymentRepo.save(paymentRepo.create({
      provider_name: 'M-PESA',
      account_name: 'Open University of Kenya',
      account_number: '222222',
      instructions: 'Use your Student Registration Number as the account number.',
      is_active: true
    }));
    await paymentRepo.save(paymentRepo.create({
      provider_name: 'KCB Bank',
      account_name: 'Open University of Kenya',
      account_number: '1122334455',
      instructions: 'Indicate your Student Registration Number on the deposit slip.',
      is_active: true
    }));
  }

  console.log('Dummy Finance Data Seeded');
  await app.close();
}

run();
