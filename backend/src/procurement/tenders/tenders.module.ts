import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tender } from './entities/tender.entity';
import { TenderCategory } from './entities/tender-category.entity';
import { TenderDocument } from './entities/tender-document.entity';
import { TendersService } from './tenders.service';
import { TendersController } from './tenders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tender, TenderCategory, TenderDocument])],
  providers: [TendersService],
  controllers: [TendersController],
  exports: [TendersService],
})
export class TendersModule {}
