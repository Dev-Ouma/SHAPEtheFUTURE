import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryWorkshop } from './library-workshop.entity';
import { LibraryTutorial } from './library-tutorial.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryWorkshop, LibraryTutorial]),
    AuthModule,
  ],
  providers: [TrainingService],
  controllers: [TrainingController],
  exports: [TrainingService],
})
export class TrainingModule {}
