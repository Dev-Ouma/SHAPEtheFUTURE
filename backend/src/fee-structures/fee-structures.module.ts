import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeStructuresService } from './fee-structures.service';
import { FeeStructuresController } from './fee-structures.controller';
import { FeeStructure } from './entities/fee-structure.entity';
import { AcademicYear } from './entities/academic-year.entity';
import { ProgrammeFee } from './entities/programme-fee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeStructure, AcademicYear, ProgrammeFee]),
  ],
  controllers: [FeeStructuresController],
  providers: [FeeStructuresService],
})
export class FeeStructuresModule {}
