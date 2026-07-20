import { createConnection } from 'typeorm';
import { Menu } from './backend/src/menus/entities/menu.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

async function run() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ouk_digital_campus',
    entities: [Menu],
    synchronize: false,
  });

  const menuRepo = connection.getRepository(Menu);

  // 1. Find the top-level redundant items
  const chancellorTop = await menuRepo.findOne({ where: { title: 'Office of the Chancellor', parent: null } });
  const vcTop = await menuRepo.findOne({ where: { title: 'Vice-Chancellor Vision', parent: null } });
  const aboutMenu = await menuRepo.findOne({ where: { title: 'About' } });

  if (chancellorTop) {
    console.log('Removing top-level Chancellor menu...');
    await menuRepo.remove(chancellorTop);
  }

  if (vcTop) {
    console.log('Removing top-level VC menu...');
    await menuRepo.remove(vcTop);
  }

  if (aboutMenu) {
    // 2. Update the child Chancellor menu
    const chancellorChild = await menuRepo.findOne({ where: { title: 'The Chancellor', parent: { id: aboutMenu.id } } });
    if (chancellorChild) {
      console.log('Updating Chancellor child menu...');
      chancellorChild.title = 'Office of the Chancellor';
      chancellorChild.link = '/university-chancellor';
      await menuRepo.save(chancellorChild);
    }

    // 3. Add VC child menu if it doesnt exist
    const vcChild = await menuRepo.findOne({ where: { title: 'Vice-Chancellor Vision', parent: { id: aboutMenu.id } } });
    if (!vcChild) {
      console.log('Adding VC child menu under About...');
      const newVc = menuRepo.create({
        title: 'Vice-Chancellor Vision',
        slug: 'about/vice-chancellor',
        link: '/vice-chancellor',
        order: 3,
        position: 'header',
        parent: aboutMenu
      });
      await menuRepo.save(newVc);
    }
  }

  await connection.close();
  console.log('Menu cleanup complete.');
}

run().catch(console.error);
