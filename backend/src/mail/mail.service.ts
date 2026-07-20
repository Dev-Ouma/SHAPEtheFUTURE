import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly settingsService: SettingsService) {}

  private async getSettingValue(key: string): Promise<string | null> {
    try {
      const setting = await this.settingsService.findOne(key);
      return setting.value;
    } catch {
      return null;
    }
  }

  /** Prefer DB settings; fall back to process.env for local/dev resilience. */
  private async resolve(
    key: string,
    envKey?: string,
    fallback?: string,
  ): Promise<string | null> {
    const fromDb = await this.getSettingValue(key);
    if (fromDb != null && String(fromDb).trim() !== '') {
      return String(fromDb).trim();
    }
    if (envKey && process.env[envKey]) {
      return String(process.env[envKey]).trim();
    }
    return fallback ?? null;
  }

  /** Gmail app passwords are often pasted with spaces — strip them. */
  private normalizePassword(pass: string): string {
    return pass.replace(/\s+/g, '');
  }

  async getTransporter(channel?: string) {
    let host: string | null = null;
    let portStr: string | null = null;
    let user: string | null = null;
    let pass: string | null = null;

    if (channel) {
      host = await this.resolve(`smtp_host_${channel}`);
      portStr = await this.resolve(`smtp_port_${channel}`);
      user = await this.resolve(`smtp_user_${channel}`);
      pass = await this.resolve(`smtp_pass_${channel}`);
    }

    host =
      host || (await this.resolve('smtp_host', 'SMTP_HOST', 'smtp.gmail.com'));
    portStr = portStr || (await this.resolve('smtp_port', 'SMTP_PORT', '587'));
    user = user || (await this.resolve('smtp_user', 'SMTP_USER'));
    pass = pass || (await this.resolve('smtp_pass', 'SMTP_PASS'));

    if (!user || !pass) {
      this.logger.warn(
        `SMTP credentials not configured for channel ${channel || 'default'}. Cannot send email.`,
      );
      return null;
    }

    const port = parseInt(portStr || '587', 10);
    const normalizedPass = this.normalizePassword(pass);

    // nodemailer@8 typings are picky about the overload; cast keeps SMTP options intact.
    const options = {
      host: host!,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user: user,
        pass: normalizedPass,
      },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
      tls: {
        minVersion: 'TLSv1.2',
      },
    };
    return nodemailer.createTransport(options as any);
  }

  queueEmail(
    channel: string | null,
    to: string,
    subject: string,
    htmlContent: string,
  ) {
    setImmediate(() => {
      void this.sendEmail(channel, to, subject, htmlContent);
    });
  }

  async sendEmail(
    channel: string | null,
    to: string,
    subject: string,
    htmlContent: string,
  ) {
    try {
      const transporter = await this.getTransporter(channel || undefined);
      if (!transporter) return false;

      let fromEmail: string | null = null;
      let fromName: string | null = null;

      if (channel) {
        fromEmail = await this.resolve(`smtp_from_email_${channel}`);
        fromName = await this.resolve(`smtp_from_name_${channel}`);
      }

      fromEmail =
        fromEmail ||
        (await this.resolve(
          'smtp_from_email',
          'SMTP_FROM_EMAIL',
          'noreply@ouk.ac.ke',
        ));
      fromName =
        fromName ||
        (await this.resolve(
          'smtp_from_name',
          'SMTP_FROM_NAME',
          'OUK Institutional Desk',
        ));

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Email sent via ${channel || 'default'} channel → ${to}: ${info.messageId}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send email via ${channel || 'default'} channel → ${to}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Verify SMTP auth and optionally send a test message.
   * Returns a structured result for the admin UI.
   */
  async testConnection(to?: string): Promise<{
    ok: boolean;
    verified: boolean;
    sent: boolean;
    message: string;
    user?: string;
    host?: string;
  }> {
    const host =
      (await this.resolve('smtp_host', 'SMTP_HOST', 'smtp.gmail.com')) ||
      'smtp.gmail.com';
    const user = (await this.resolve('smtp_user', 'SMTP_USER')) || undefined;
    const transporter = await this.getTransporter();
    if (!transporter || !user) {
      return {
        ok: false,
        verified: false,
        sent: false,
        message: 'SMTP user/password are not configured in Settings.',
        host,
        user,
      };
    }

    try {
      await transporter.verify();
    } catch (error: any) {
      return {
        ok: false,
        verified: false,
        sent: false,
        message: `SMTP login failed: ${error.message}`,
        host,
        user,
      };
    }

    if (!to) {
      return {
        ok: true,
        verified: true,
        sent: false,
        message: `SMTP login OK for ${user} via ${host}.`,
        host,
        user,
      };
    }

    const sent = await this.sendEmail(
      'system',
      to,
      'OUK SMTP test',
      this.getBrandedTemplate(
        'SMTP test successful',
        `<p>This confirms the Open University of Kenya mailer can send from <strong>${user}</strong>.</p>`,
        undefined,
        'System Mailer',
      ),
    );

    return {
      ok: sent,
      verified: true,
      sent,
      message: sent
        ? `Verified and sent a test email to ${to}.`
        : `SMTP login OK, but sending to ${to} failed. Check backend logs.`,
      host,
      user,
    };
  }

  // Define branded templates
  getBrandedTemplate(
    title: string,
    body: string,
    trackingUrl?: string,
    department: string = 'Institutional Grievance Desk',
  ) {
    return `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #003e48; padding: 24px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Open University of Kenya</h2>
          <p style="color: #ff7f50; margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${department}</p>
        </div>
        <div style="padding: 32px; color: #1e293b;">
          <h3 style="color: #003e48; margin-top: 0;">${title}</h3>
          <div style="line-height: 1.6; color: #475569;">
            ${body}
          </div>
          ${
            trackingUrl
              ? `
            <div style="margin-top: 32px; text-align: center;">
              <a href="${trackingUrl}" style="background-color: #ff7f50; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; display: inline-block;">Track Your Case</a>
            </div>
          `
              : ''
          }
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">This is an automated orchestration message. Please do not reply directly.</p>
        </div>
      </div>
    `;
  }

  // IAM Email Templates
  getWelcomeEmailTemplate(
    email: string,
    username: string,
    otp: string,
    loginUrl: string,
  ) {
    const body = `
      <p>Welcome to the Open University of Kenya! Your account has been successfully created.</p>
      <p>Please use the following credentials to log in for the first time:</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #475569;">Login Email</p>
        <p style="margin: 5px 0 15px; font-size: 16px; font-weight: bold; color: #0f172a;">${email}</p>
        <p style="margin: 0; font-size: 14px; color: #475569;">Username</p>
        <p style="margin: 5px 0 15px; font-size: 18px; font-weight: bold; color: #0f172a;">${username}</p>
        <p style="margin: 0; font-size: 14px; color: #475569;">One-Time Password (OTP)</p>
        <p style="margin: 5px 0 0; font-size: 24px; font-weight: black; color: #ff7f50; letter-spacing: 4px;">${otp}</p>
      </div>
      <p>This temporary password expires in 24 hours. You will be required to change your password immediately upon your first login.</p>
      <div style="margin-top: 32px; text-align: center;">
        <a href="${loginUrl}" style="background-color: #003e48; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; display: inline-block;">Access Portal</a>
      </div>
    `;
    return this.getBrandedTemplate(
      'Welcome to OUK',
      body,
      undefined,
      'Identity & Access Management',
    );
  }

  getPasswordResetTemplate(resetUrl: string) {
    const body = `
      <p>We received a request to reset the password for your Open University of Kenya account.</p>
      <p>If you made this request, please click the secure link below to set a new password. This link will expire in 1 hour.</p>
      <div style="margin-top: 32px; text-align: center;">
        <a href="${resetUrl}" style="background-color: #003e48; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; display: inline-block;">Reset Password</a>
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email or contact ICT Support immediately.</p>
    `;
    return this.getBrandedTemplate(
      'Password Reset Request',
      body,
      undefined,
      'Identity & Access Management',
    );
  }

  getSecurityAlertTemplate(actionDetails: string) {
    const body = `
      <p>A security event has been recorded on your Open University of Kenya account.</p>
      <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #be123c; font-weight: bold;">Event Details:</p>
        <p style="margin: 8px 0 0; color: #9f1239;">${actionDetails}</p>
      </div>
      <p>If you recognise this activity, no further action is required. If this was not you, please secure your account immediately by resetting your password and contacting ICT Support.</p>
    `;
    return this.getBrandedTemplate(
      'Security Alert',
      body,
      undefined,
      'Institutional Security Desk',
    );
  }

  getRoleUpdateTemplate(newRole: string) {
    const body = `
      <p>Your access permissions at the Open University of Kenya have been updated by an administrator.</p>
      <p>Your new primary role is now: <strong>${newRole}</strong></p>
      <p>This change takes effect immediately. You may need to log out and log back in to see the updated features on your dashboard.</p>
    `;
    return this.getBrandedTemplate(
      'Access Permissions Updated',
      body,
      undefined,
      'Identity & Access Management',
    );
  }
}
