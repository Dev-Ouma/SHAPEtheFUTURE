
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DownloadsService } from './src/downloads/downloads.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(DownloadsService);

  try {
    console.log('Testing DownloadsService.findAll({ isAdmin: true, page: 1, limit: 10 })...');
    const result = await service.findAll({ isAdmin: true, page: 1, limit: 10 });
    console.log('Result count:', result.data.length);
    console.log('Total:', result.total);
  } catch (err) {
    console.error('FAILED with error:');
    console.error(err);
    if (err.query) console.error('Query:', err.query);
    if (err.parameters) console.error('Parameters:', err.parameters);
  } finally {
    await app.close();
  }
}

bootstrap();
