import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { Menu } from './src/menus/entities/menu.entity';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('--- RESTORING MENUS FROM menus.json ---');
  try {
    const menusJson = JSON.parse(fs.readFileSync('menus.json', 'utf8'));
    
    // Clear existing menus completely
    await dataSource.query('TRUNCATE TABLE menus CASCADE');
    console.log('Cleared existing menus.');

    const menuRepo = dataSource.getRepository(Menu);

    // Helper to insert menu and children
    async function insertMenu(item: any, parent: Menu | null = null) {
      const menu = menuRepo.create({
        id: item.id,
        title: item.title,
        slug: item.slug,
        link: item.link,
        order: item.order,
        is_public: item.is_public,
        position: item.position,
        target: item.target,
        parent: parent
      });
      const saved = await menuRepo.save(menu);

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          await insertMenu(child, saved);
        }
      }
    }

    for (const item of menusJson) {
      await insertMenu(item);
    }

    console.log('--- MENU RESTORE COMPLETED SUCCESSFULY ---');
  } catch (error) {
    console.error('--- MENU RESTORE FAILED ---');
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
