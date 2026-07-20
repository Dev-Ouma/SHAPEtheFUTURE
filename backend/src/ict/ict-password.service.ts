import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, AccountStatus } from '../auth/entities/user.entity';
import { AppPermission } from '../auth/entities/app-permission.entity';
import { MailService } from '../mail/mail.service';
import { UserTemporaryGrant } from './entities/user-temporary-grant.entity';

// Helpdesk account assistance for ICT officers — reuses the existing user + permission
// data (Identity Management) to reset passwords, pause/resume accounts, and grant
// time-boxed modules (added to the user's allowedPermissions, then auto-expired).
@Injectable()
export class IctPasswordService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(AppPermission)
    private permissionRepo: Repository<AppPermission>,
    @InjectRepository(UserTemporaryGrant)
    private grantRepo: Repository<UserTemporaryGrant>,
    private mailService: MailService,
  ) {}

  private get loginUrl() {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`;
  }

  private async findUser(
    query: string,
    relations: string[] = [],
  ): Promise<User> {
    const q = (query || '').trim();
    const user = await this.userRepo.findOne({
      where: [{ email: q }, { username: q }],
      relations,
    });
    if (!user)
      throw new NotFoundException(
        'No account found for that email or username.',
      );
    return user;
  }

  async lookup(query: string) {
    const user = await this.findUser(query, ['role']);
    const grants = await this.activeGrantsForUser(user.id);
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: user.role?.name || user.role_legacy || '—',
      is_active: user.is_active,
      account_status: user.account_status,
      is_locked: !!(
        user.locked_until && new Date(user.locked_until) > new Date()
      ),
      locked_until: user.locked_until,
      login_attempts: user.login_attempts,
      last_login_at: user.last_login_at,
      temporary_grants: grants.map((g) => ({
        id: g.id,
        permission: {
          id: g.permission?.id,
          name: g.permission?.name,
          slug: g.permission?.slug,
        },
        expires_at: g.expires_at,
        reason: g.reason,
      })),
    };
  }

  // ─── Password operations ─────────────────────────────────────────────────

  async sendResetLink(query: string) {
    const user = await this.findUser(query);
    const resetToken = randomBytes(32).toString('hex');
    user.reset_token = resetToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepo.save(user);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    const html = this.mailService.getPasswordResetTemplate(resetUrl);
    await this.mailService.sendEmail(
      'system',
      user.email,
      'Password Reset Request',
      html,
    );
    return { sent: true, email: user.email };
  }

  async provisionTemporaryPassword(query: string) {
    const user = await this.findUser(query);
    const tempPassword = randomBytes(5).toString('hex');
    user.password = await bcrypt.hash(tempPassword, 10);
    user.last_password_change_at = null as any;
    user.provisioned_password_expires_at = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    user.locked_until = null as any;
    user.login_attempts = 0;
    await this.userRepo.save(user);

    const html = this.mailService.getWelcomeEmailTemplate(
      user.email,
      user.username || user.email,
      tempPassword,
      this.loginUrl,
    );
    await this.mailService.sendEmail(
      'system',
      user.email,
      'Temporary Access Provisioned - Open University of Kenya',
      html,
    );
    return {
      provisioned: true,
      email: user.email,
      temporary_password: tempPassword,
    };
  }

  async unlock(query: string) {
    const user = await this.findUser(query);
    user.locked_until = null as any;
    user.login_attempts = 0;
    if (user.account_status === AccountStatus.SUSPENDED)
      user.account_status = AccountStatus.ACTIVE;
    user.is_active = true;
    await this.userRepo.save(user);
    return { unlocked: true, email: user.email };
  }

  // ─── Pause / resume (reuses the existing account_status + is_active fields) ─

  async suspend(query: string) {
    const user = await this.findUser(query);
    user.account_status = AccountStatus.SUSPENDED;
    user.is_active = false;
    await this.userRepo.save(user);
    return { suspended: true, email: user.email };
  }

  async reactivate(query: string) {
    return this.unlock(query);
  }

  // ─── Temporary module grants ─────────────────────────────────────────────

  // Permissions an officer can hand out, for the picker. Reuses the permission registry.
  async grantableModules() {
    return this.permissionRepo.find({ order: { name: 'ASC' } });
  }

  private async activeGrantsForUser(
    userId: string,
  ): Promise<UserTemporaryGrant[]> {
    return this.grantRepo.find({
      where: {
        user: { id: userId },
        revoked_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
      order: { expires_at: 'ASC' },
    });
  }

  async grantTemporaryModule(
    query: string,
    permissionId: string,
    days: number,
    grantedById?: string,
    reason?: string,
  ) {
    if (!permissionId)
      throw new BadRequestException('A module (permission) is required.');
    const duration = Number(days) > 0 ? Number(days) : 1;
    const user = await this.findUser(query, ['allowedPermissions']);
    const permission = await this.permissionRepo.findOne({
      where: { id: permissionId },
    });
    if (!permission) throw new NotFoundException('Module not found.');

    // Grant access by reusing the existing per-user allowed permissions.
    const already = (user.allowedPermissions || []).some(
      (p) => p.id === permission.id,
    );
    if (!already) {
      user.allowedPermissions = [
        ...(user.allowedPermissions || []),
        permission,
      ];
      await this.userRepo.save(user);
    }

    const grant = this.grantRepo.create({
      user: { id: user.id } as User,
      permission: { id: permission.id } as AppPermission,
      granted_by: grantedById ? ({ id: grantedById } as User) : undefined,
      reason,
      expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
    });
    await this.grantRepo.save(grant);
    return {
      granted: true,
      module: permission.name,
      expires_at: grant.expires_at,
    };
  }

  async listGrants(query: string) {
    const user = await this.findUser(query);
    return this.activeGrantsForUser(user.id);
  }

  async revokeGrant(grantId: string) {
    const grant = await this.grantRepo.findOne({
      where: { id: grantId },
      relations: ['user', 'permission'],
    });
    if (!grant) throw new NotFoundException('Grant not found.');
    grant.revoked_at = new Date();
    await this.grantRepo.save(grant);
    await this.removePermissionIfNoOtherActiveGrant(
      grant.user.id,
      grant.permission.id,
      grant.id,
    );
    return { revoked: true };
  }

  // Strip the permission from allowedPermissions unless another active grant still needs it.
  private async removePermissionIfNoOtherActiveGrant(
    userId: string,
    permissionId: string,
    ignoreGrantId: string,
  ) {
    const others = await this.grantRepo.count({
      where: {
        user: { id: userId },
        permission: { id: permissionId },
        revoked_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });
    if (others > 0) return;
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['allowedPermissions'],
    });
    if (user && user.allowedPermissions?.some((p) => p.id === permissionId)) {
      user.allowedPermissions = user.allowedPermissions.filter(
        (p) => p.id !== permissionId,
      );
      await this.userRepo.save(user);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireGrants() {
    const due = await this.grantRepo.find({
      where: { revoked_at: IsNull(), expires_at: LessThanOrEqual(new Date()) },
      relations: ['user', 'permission'],
    });
    for (const grant of due) {
      grant.revoked_at = new Date();
      await this.grantRepo.save(grant);
      await this.removePermissionIfNoOtherActiveGrant(
        grant.user.id,
        grant.permission.id,
        grant.id,
      );
    }
    if (due.length)
      console.log(`Expired ${due.length} temporary module grant(s).`);
  }
}
