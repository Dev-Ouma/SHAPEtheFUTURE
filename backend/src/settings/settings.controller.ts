import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CmsHttpCacheInterceptor } from '../common/cms-http-cache.interceptor';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get('public')
  findPublic(@Query('locale') locale?: string) {
    return this.settingsService.findPublic(locale);
  }

  @RequirePermission(['settings.view', 'settings.manage'])
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Public()
  @UseInterceptors(CmsHttpCacheInterceptor)
  @CacheTTL(120 * 1000)
  @Get('public/:key')
  findOnePublic(@Param('key') key: string) {
    return this.settingsService.findOnePublic(key);
  }

  @RequirePermission(['settings.view', 'settings.manage'])
  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @RequirePermission('settings.manage')
  @Post('bulk')
  async updateBulk(@Body() body: Record<string, string>) {
    // Never wipe secrets when the admin UI posts blank password fields.
    const secretKeys = new Set([
      'smtp_pass',
      'smtp_pass_subscriptions',
      'smtp_pass_support',
      'smtp_pass_system',
      'smtp_pass_complaints',
      'smtp_pass_news',
      'openai_api_key',
      'google_client_secret',
      'facebook_access_token',
      'instagram_access_token',
      'twitter_bearer_token',
    ]);

    const entries = Object.entries(body).filter(([key, value]) => {
      if (secretKeys.has(key) && (!value || String(value).trim() === '')) {
        return false;
      }
      return true;
    });

    const results = await Promise.allSettled(
      entries.map(([key, value]) =>
        this.settingsService.update(key, String(value ?? '')),
      ),
    );
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      return {
        success: false,
        message: `${failed.length} settings failed to save`,
        results,
      };
    }
    return { success: true, updated: entries.length };
  }

  @RequirePermission('settings.manage')
  @Post(':key')
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto.value);
  }
}
