import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeed } from './database/seeds/initial-seed';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const authService = app.get(AuthService);

  console.log('--- STARTING GLOBAL SEEDING ---');
  try {
    // 1. Initialize RBAC Framework
    console.log('Initializing RBAC Framework...');
    await authService.initializeRbac();

    // 2. Run Database Seeds
    await runSeed(dataSource);
    console.log('--- SEEDING COMPLETED SUCCESSFULY ---');
  } catch (error) {
    console.error('--- SEEDING FAILED ---');
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
