import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { InformationLiteracyService } from './information-literacy.service';
import { InformationLiteracyConfig } from './entities/information-literacy.entity';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermission } from '../../auth/decorators/permissions.decorator';

@Controller('library/information-literacy')
export class InformationLiteracyController {
  constructor(
    private readonly infoLiteracyService: InformationLiteracyService,
  ) {}

  @Public()
  @Get()
  getConfig() {
    return this.infoLiteracyService.getConfig();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('knowledge_hub.manage')
  @Patch()
  updateConfig(@Body() updateData: Partial<InformationLiteracyConfig>) {
    return this.infoLiteracyService.updateConfig(updateData);
  }
}
