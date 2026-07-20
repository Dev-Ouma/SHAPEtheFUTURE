import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../entities/user.entity';

/**
 * Attaches `shapeUser` and `partnerScopeId` to the request.
 * Partner-linked users may only act on their own institution's data;
 * global SHAPE admins get `partnerScopeId = null` (unrestricted).
 */
@Injectable()
export class PartnerScopeGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const summary = request.user;
    if (!summary?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.authService.findOneWithPermissions(summary.userId);
    if (!user) {
      throw new UnauthorizedException('Identity verification failed');
    }

    request.shapeUser = user;

    if (this.isGlobalShapeAdmin(user)) {
      request.partnerScopeId = null;
      return true;
    }

    const partnerId = user.partner_institution_id || null;
    request.partnerScopeId = partnerId;

    if (!partnerId) {
      return true;
    }

    const bodyPartner =
      request.body?.partner_id || request.body?.host_partner_id;
    if (bodyPartner && bodyPartner !== partnerId) {
      throw new ForbiddenException(
        'You can only attach content to your own partner institution.',
      );
    }

    return true;
  }

  isGlobalShapeAdmin(user: User): boolean {
    if (user.partner_institution_id) return false;
    if (
      user.role_legacy === UserRole.SUPER_ADMIN ||
      user.role_legacy === UserRole.ADMIN ||
      user.role?.name === 'Super Administrator' ||
      user.role?.name === 'Administrator' ||
      user.role?.name === 'Content Manager'
    ) {
      return true;
    }
    const slugs = new Set([
      ...(user.role?.permissions || []).map((p) => p.slug),
      ...(user.allowedPermissions || []).map((p) => p.slug),
    ]);
    return slugs.has('shape.manage') || slugs.has('pages.manage');
  }
}
