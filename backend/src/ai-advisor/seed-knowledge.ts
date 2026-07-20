import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(KnowledgeIngestionService);

  console.log('Starting full knowledge base sync...');
  const results = await ingestionService.syncAll();
  console.log('Sync complete:', results);

  await app.close();
}
bootstrap();
