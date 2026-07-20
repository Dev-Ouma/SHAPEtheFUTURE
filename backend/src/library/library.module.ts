import { Module } from '@nestjs/common';
import { DatabasesModule } from './databases/databases.module';
import { TrainingModule } from './training/training.module';
import { InformationLiteracyModule } from './information-literacy/information-literacy.module';
import { EResourcesModule } from './e-resources/e-resources.module';

@Module({
  imports: [
    DatabasesModule,
    TrainingModule,
    InformationLiteracyModule,
    EResourcesModule,
  ],
  exports: [
    DatabasesModule,
    TrainingModule,
    InformationLiteracyModule,
    EResourcesModule,
  ],
})
export class LibraryModule {}
