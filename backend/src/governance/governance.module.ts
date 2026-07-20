import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';
import { Page } from '../pages/entities/page.entity';
import { News } from '../news/entities/news.entity';
import { Program } from '../programs/entities/program.entity';
import { School } from '../programs/entities/school.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, News, Program, School]),
    AuthModule,
  ],
  controllers: [GovernanceController],
  providers: [GovernanceService],
})
export class GovernanceModule {}
