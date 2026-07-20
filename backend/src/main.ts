import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { json, urlencoded } from 'express';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { BrowserFriendlyExceptionFilter } from './common/filters/browser-friendly-exception.filter';
import { runMigrationsOnStartIfEnabled } from './database/run-migrations-on-start';

async function bootstrap() {
  // Opt-in only (RUN_MIGRATIONS_ON_START=true). Local/dev with synchronize stays untouched.
  await runMigrationsOnStartIfEnabled();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('OUK', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        // File logging for centralized observability
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Behind nginx / load balancer (Docker & host installs). Harmless for direct local access.
  const httpInstance = app.getHttpAdapter().getInstance();
  if (typeof httpInstance?.set === 'function') {
    httpInstance.set('trust proxy', 1);
  }

  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // Production: built-in HTTPS origins only. Add localhost/staging via CORS_ORIGINS.
  // Local `npm run start:dev` keeps open CORS (isDev).
  const productionOrigins = Array.from(
    new Set(['https://ouk.ac.ke', 'https://www.ouk.ac.ke', ...extraOrigins]),
  );

  app.enableCors({
    origin: isDev ? true : productionOrigins,
    credentials: true,
  });
  // Production rejects undeclared DTO fields; local/dev keeps strip-only so
  // exploratory clients are not broken. Override with FORBID_NON_WHITELISTED.
  const forbidNonWhitelisted =
    (process.env.FORBID_NON_WHITELISTED ??
      (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties from DTOs
      forbidNonWhitelisted,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new BrowserFriendlyExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap failure:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
