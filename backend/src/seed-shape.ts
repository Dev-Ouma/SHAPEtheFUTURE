import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runShapeSeed } from './database/seeds/shape-seed';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const authService = app.get(AuthService);

  console.log('--- STARTING SHAPE SEED ---');
  try {
    console.log('Initializing RBAC (shape.manage + roles)...');
    try {
      await authService.initializeRbac();
    } catch (rbacErr: any) {
      // Partial RBAC is OK — PermissionsGuard also trusts role_legacy super_admin.
      console.warn(
        'RBAC init warning (continuing):',
        rbacErr?.message || rbacErr,
      );
    }
    await runShapeSeed(dataSource);
    console.log('--- SHAPE SEED COMPLETED ---');
  } catch (error) {
    console.error('--- SHAPE SEED FAILED ---');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
