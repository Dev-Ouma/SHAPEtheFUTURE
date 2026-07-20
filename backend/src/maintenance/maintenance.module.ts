import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceSetting } from './entities/maintenance-setting.entity';
import { MaintenanceModule as MaintenanceAllowedModuleEntity } from './entities/maintenance-module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceSetting,
      MaintenanceAllowedModuleEntity,
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
