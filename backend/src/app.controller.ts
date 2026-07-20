import { Public } from './common/decorators/public.decorator';
import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { runSeed } from './database/seeds/initial-seed';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('api/ping')
  ping() {
    return { ok: true };
  }

  @Post('seed')
  async seed() {
    await runSeed(this.dataSource);
    return { message: 'Database seeded successfully' };
  }
}
