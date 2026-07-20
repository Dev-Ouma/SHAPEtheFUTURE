import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { AdminSidebarCategory, AdminSidebarItem } from './src/admin-sidebar/entities/admin-sidebar.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const catRepo = dataSource.getRepository(AdminSidebarCategory);
  const itemRepo = dataSource.getRepository(AdminSidebarItem);

  let category = await catRepo.findOne({ where: { title: 'Finance & Accounts' }});
  if (!category) {
    category = catRepo.create({ title: 'Finance & Accounts', order: 5 });
    await catRepo.save(category);
  }

  const items = [
    { label: 'Academic Years', href: '/admin/finance/academic-years', icon: 'CalendarDays', order: 1 },
    { label: 'Programme Fees', href: '/admin/finance/programme-fees', icon: 'Receipt', order: 2 },
    { label: 'Scholarships', href: '/admin/finance/scholarships', icon: 'Award', order: 3 },
    { label: 'Payment Methods', href: '/admin/finance/payment-methods', icon: 'CreditCard', order: 4 },
  ];

  for (const item of items) {
    const existing = await itemRepo.findOne({ where: { href: item.href }});
    if (!existing) {
      await itemRepo.save(itemRepo.create({ ...item, category }));
    }
  }

  console.log('Finance menu added');
  await app.close();
}

run();
