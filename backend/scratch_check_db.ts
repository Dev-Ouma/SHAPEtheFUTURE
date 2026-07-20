
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DownloadsService } from './src/downloads/downloads.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Download } from './src/downloads/entities/download.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(DownloadsService);
  const downloadRepo = app.get('DownloadRepository'); // This might depend on how it's named

  try {
    console.log('--- Checking Downloads data ---');
    const allDownloads = await service.findAll({ isAdmin: true, limit: 100 });
    console.log('Admin view count:', allDownloads.total);
    console.log('Admin items:', allDownloads.data.map(d => ({ id: d.id, title: d.title, status: d.status })));

    const publicDownloads = await service.findAll({ isAdmin: false, limit: 100 });
    console.log('Public view count:', publicDownloads.total);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
