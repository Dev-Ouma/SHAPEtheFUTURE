import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { AdminSidebarCategory, AdminSidebarItem } from './src/admin-sidebar/entities/admin-sidebar.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const catRepo = dataSource.getRepository(AdminSidebarCategory);
  const itemRepo = dataSource.getRepository(AdminSidebarItem);

  // Find Academics category
  let academicsCategory = await catRepo.findOne({ where: { title: 'Academics' }});
  
  // Create if it doesn't exist (though it should)
  if (!academicsCategory) {
    academicsCategory = catRepo.create({ title: 'Academics', order: 2 });
    await catRepo.save(academicsCategory);
  }

  // Find the Finance items and update their category
  const financeHrefs = [
    '/admin/finance/academic-years',
    '/admin/finance/programme-fees',
    '/admin/finance/scholarships',
    '/admin/finance/payment-methods'
  ];

  for (const href of financeHrefs) {
    const item = await itemRepo.findOne({ where: { href } });
    if (item) {
      item.category = academicsCategory;
      await itemRepo.save(item);
    }
  }

  // Optionally delete the Finance category if it's empty
  const financeCategory = await catRepo.findOne({ where: { title: 'Finance & Accounts' }, relations: ['items'] });
  if (financeCategory && (!financeCategory.items || financeCategory.items.length === 0)) {
    await catRepo.remove(financeCategory);
  }

  console.log('Successfully moved Finance items to Academics menu.');
  await app.close();
}

run();
