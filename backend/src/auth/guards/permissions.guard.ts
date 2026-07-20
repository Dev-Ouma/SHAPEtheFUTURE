import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string | string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permission is required, proceed
    if (!required || (Array.isArray(required) && required.length === 0)) {
      return true;
    }

    const requiredPermissions = Array.isArray(required) ? required : [required];

    const request = context.switchToHttp().getRequest();
    const userSummary = request.user;

    if (!userSummary || !userSummary.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Load full user with role and permission associations via AuthService
    const user = await this.authService.findOneWithPermissions(
      userSummary.userId,
    );

    if (!user) {
      throw new UnauthorizedException('Identity verification failed');
    }

    // Super / system admins have full CMS access (SHAPE + inherited modules).
    if (
      user.role_legacy === UserRole.SUPER_ADMIN ||
      user.role_legacy === UserRole.ADMIN ||
      user.role?.name === 'Super Administrator' ||
      user.role?.name === 'Administrator'
    ) {
      return true;
    }

    const denied = new Set((user.deniedPermissions || []).map((p) => p.slug));
    const granted = new Set([
      ...(user.allowedPermissions || []).map((p) => p.slug),
      ...(user.role?.permissions || []).map((p) => p.slug),
    ]);

    // Explicit deny on any listed permission blocks that option; OR across the rest.
    const allowedOptions = requiredPermissions.filter(
      (slug) => !denied.has(slug),
    );
    if (allowedOptions.length === 0) {
      throw new ForbiddenException(
        `Access to '${requiredPermissions.join("' / '")}' has been explicitly revoked for your account.`,
      );
    }

    if (allowedOptions.some((slug) => granted.has(slug))) {
      return true;
    }

    throw new ForbiddenException(
      `You do not have the required capability: '${allowedOptions.join("' or '")}'`,
    );
  }
}
