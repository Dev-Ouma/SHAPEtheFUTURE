import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

import { PartnerInstitution } from './entities/partner-institution.entity';
import { WorkPackage } from './entities/work-package.entity';
import { ShapeEvent } from './entities/shape-event.entity';
import { ShapeDocument } from './entities/shape-document.entity';
import { ShapeActivity } from './entities/shape-activity.entity';
import { ShapeKpi } from './entities/shape-kpi.entity';
import { ShapeRisk } from './entities/shape-risk.entity';
import { ShapeSdlcStage } from './entities/shape-sdlc-stage.entity';
import { ShapeContactMessage } from './entities/shape-contact-message.entity';
import { ShapePressItem } from './entities/shape-press-item.entity';

import { ShapePartnersService } from './shape-partners.service';
import { ShapeWorkPackagesService } from './shape-work-packages.service';
import { ShapeEventsService } from './shape-events.service';
import { ShapeDocumentsService } from './shape-documents.service';
import { ShapeActivitiesService } from './shape-activities.service';
import { ShapeKpisService } from './shape-kpis.service';
import { ShapeRisksService } from './shape-risks.service';
import { ShapeSdlcService } from './shape-sdlc.service';
import { ShapeContactService } from './shape-contact.service';
import { ShapeDashboardService } from './shape-dashboard.service';
import { ShapePressService } from './shape-press.service';

import { ShapePartnersController } from './shape-partners.controller';
import { ShapeWorkPackagesController } from './shape-work-packages.controller';
import { ShapeEventsController } from './shape-events.controller';
import { ShapeDocumentsController } from './shape-documents.controller';
import { ShapeActivitiesController } from './shape-activities.controller';
import { ShapeKpisController } from './shape-kpis.controller';
import { ShapeRisksController } from './shape-risks.controller';
import { ShapeSdlcController } from './shape-sdlc.controller';
import { ShapeContactController } from './shape-contact.controller';
import { ShapeDashboardController } from './shape-dashboard.controller';
import { ShapePressController } from './shape-press.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartnerInstitution,
      WorkPackage,
      ShapeEvent,
      ShapeDocument,
      ShapeActivity,
      ShapeKpi,
      ShapeRisk,
      ShapeSdlcStage,
      ShapeContactMessage,
      ShapePressItem,
    ]),
    AuthModule,
  ],
  controllers: [
    ShapePartnersController,
    ShapeWorkPackagesController,
    ShapeEventsController,
    ShapeDocumentsController,
    ShapeActivitiesController,
    ShapeKpisController,
    ShapeRisksController,
    ShapeSdlcController,
    ShapeContactController,
    ShapeDashboardController,
    ShapePressController,
  ],
  providers: [
    ShapePartnersService,
    ShapeWorkPackagesService,
    ShapeEventsService,
    ShapeDocumentsService,
    ShapeActivitiesService,
    ShapeKpisService,
    ShapeRisksService,
    ShapeSdlcService,
    ShapeContactService,
    ShapeDashboardService,
    ShapePressService,
  ],
  exports: [
    ShapePartnersService,
    ShapeWorkPackagesService,
    ShapeEventsService,
    ShapeDocumentsService,
    ShapeActivitiesService,
    ShapeKpisService,
    ShapeRisksService,
    ShapeSdlcService,
    ShapeContactService,
    ShapeDashboardService,
    ShapePressService,
  ],
})
export class ShapeModule {}
