import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AdminSidebarItem } from './src/admin-sidebar/entities/admin-sidebar.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [AdminSidebarItem],
});

async function run() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(AdminSidebarItem);
  const item = await repo.findOne({ where: { label: 'Strategic Dashboard' } });
  if (item) {
    item.href = '/admin';
    await repo.save(item);
    console.log('Fixed DB link!');
  } else {
    console.log('Not found');
  }
  await dataSource.destroy();
}
run();
