import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { MaintenanceService } from './maintenance.service';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';
import { CmsCacheService } from '../common/cms-cache.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly cmsCache: CmsCacheService,
  ) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(15 * 1000)
  @Get('status')
  getStatus() {
    // Public endpoint for the Next.js middleware / layout to hit
    return this.maintenanceService.getStatus();
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getSettings() {
    return this.maintenanceService.getSettings();
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateSettings(@Body() dto: UpdateMaintenanceDto) {
    const result = await this.maintenanceService.updateSettings(dto);
    // Drop Redis/HTTP cache so middleware sees the new mode promptly
    void this.cmsCache.invalidateMaintenance();
    return result;
  }
}
