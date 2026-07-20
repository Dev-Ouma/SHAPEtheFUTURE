
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { runPeerLearnersSeed } from './src/database/seeds/peer-learners-seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await runPeerLearnersSeed(dataSource);
    console.log('Peer Learners seeding complete.');
  } catch (err) {
    console.error('Error during peer learners seeding:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
