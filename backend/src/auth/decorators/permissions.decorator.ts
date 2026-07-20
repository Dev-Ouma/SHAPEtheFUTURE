import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/** Require one permission, or any of several (OR). */
export const RequirePermission = (permission: string | string[]) =>
  SetMetadata(PERMISSIONS_KEY, permission);
