import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { MailService } from './mail.service';
import { MailTestDto } from './dto/mail-test.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /** Verify SMTP credentials and optionally send a test message. */
  @RequirePermission('settings.manage')
  @Post('test')
  test(@Body() body: MailTestDto) {
    return this.mailService.testConnection(body?.to?.trim() || undefined);
  }
}
