import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BackLink,
  Partner,
  PartnerCategory,
  PartnershipProject,
} from './entities/backlink.entity';
import { BackLinksService } from './backlinks.service';
import { BackLinksController } from './backlinks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BackLink,
      Partner,
      PartnerCategory,
      PartnershipProject,
    ]),
  ],
  controllers: [BackLinksController],
  providers: [BackLinksService],
  exports: [BackLinksService],
})
export class BackLinksModule {}
