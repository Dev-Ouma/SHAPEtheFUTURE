import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EResource } from './entities/e-resource.entity';
import { EResourceProvider } from './entities/provider.entity';
import { EResourceSubject } from './entities/subject.entity';
import { EResourcesService } from './e-resources.service';
import { EResourcesController } from './e-resources.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EResource, EResourceProvider, EResourceSubject]),
    AuthModule,
  ],
  providers: [EResourcesService],
  controllers: [EResourcesController],
  exports: [EResourcesService],
})
export class EResourcesModule {}
