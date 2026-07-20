import type { CookieOptions } from 'express';

/** HttpOnly admin session cookie name — must stay aligned with JWT extractors. */
export const ADMIN_AUTH_COOKIE = 'ouk_admin_token';

/**
 * Shared cookie attributes for set + clear.
 * Keep path/sameSite/secure identical on logout or browsers will leave a stale cookie.
 *
 * AUTH_COOKIE_SECURE=true|false overrides NODE_ENV-based secure flag
 * (useful behind TLS terminators where NODE_ENV may differ).
 */
export function adminAuthCookieOptions(
  overrides?: CookieOptions,
): CookieOptions {
  const secureOverride = process.env.AUTH_COOKIE_SECURE;
  const secure =
    secureOverride === 'true'
      ? true
      : secureOverride === 'false'
        ? false
        : process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    ...overrides,
  };
}

/** Options for clearCookie — omit maxAge so Express clears correctly. */
export function adminAuthClearCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...rest } = adminAuthCookieOptions();
  return rest;
}
