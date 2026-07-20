import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ServiceCharterController } from './service-charter.controller';
import { ServiceCharterService } from './service-charter.service';
import { ServiceCharterItem } from './entities/service-charter-item.entity';
import { ServiceCharterVideo } from './entities/service-charter-video.entity';
import { ServiceCharterDocument } from './entities/service-charter-document.entity';
import { ServiceCharterFaq } from './entities/service-charter-faq.entity';
import { ServiceCharterNotice } from './entities/service-charter-notice.entity';
import { ServiceCharterMetric } from './entities/service-charter-metric.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ServiceCharterItem,
      ServiceCharterVideo,
      ServiceCharterDocument,
      ServiceCharterFaq,
      ServiceCharterNotice,
      ServiceCharterMetric,
    ]),
  ],
  controllers: [ServiceCharterController],
  providers: [ServiceCharterService],
  exports: [ServiceCharterService],
})
export class ServiceCharterModule {}
