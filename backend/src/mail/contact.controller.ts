import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { MailService } from './mail.service';
import { SettingsService } from '../settings/settings.service';

@Controller('contact-submissions')
export class ContactController {
  constructor(
    private readonly mailService: MailService,
    private readonly settingsService: SettingsService,
  ) {}

  @Public()
  @Post()
  async submit(
    @Body()
    body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    },
  ) {
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const subject = String(body?.subject || 'General inquiry').trim();
    const message = String(body?.message || '').trim();

    if (!name || name.length < 2) {
      throw new BadRequestException('Name is required');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid email is required');
    }
    if (!message || message.length < 10) {
      throw new BadRequestException('Message must be at least 10 characters');
    }

    const publicSettings = (await this.settingsService.findPublic()) as Record<
      string,
      string
    >;
    const to =
      publicSettings.contact_email ||
      process.env.CONTACT_EMAIL ||
      'info@ouk.ac.ke';

    const html = `
      <p><strong>New website contact inquiry</strong></p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `;

    const sent = await this.mailService.sendEmail(
      'smtp',
      to,
      `[OUK Contact] ${subject}`,
      html,
    );

    return {
      ok: true,
      delivered: !!sent,
      message: sent
        ? 'Your message has been received.'
        : 'Your message was accepted. Delivery may be delayed if mail is unavailable.',
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
