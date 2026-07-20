import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformationLiteracyService } from './information-literacy.service';
import { InformationLiteracyController } from './information-literacy.controller';
import { InformationLiteracyConfig } from './entities/information-literacy.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([InformationLiteracyConfig]), AuthModule],
  controllers: [InformationLiteracyController],
  providers: [InformationLiteracyService],
  exports: [InformationLiteracyService],
})
export class InformationLiteracyModule {}
