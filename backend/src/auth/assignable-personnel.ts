import { User, UserRole } from './entities/user.entity';

/**
 * Roles that must not appear in ticket / feedback assignment pickers.
 * These are executive or oversight accounts — not day-to-day assignees.
 */
export const ASSIGNMENT_EXCLUDED_ROLE_NAMES = [
  'Super Administrator',
  'Administrator',
  'Vice Chancellor',
  'DVC Infrastructure',
  'Institutional Viewer',
  'Service Desk Manager',
] as const;

const EXCLUDED_NAME_KEYS = new Set(
  ASSIGNMENT_EXCLUDED_ROLE_NAMES.map((n) =>
    n.toLowerCase().replace(/\s+/g, ' ').trim(),
  ),
);

/** Only used when the user has no formal Role row linked. */
const EXCLUDED_LEGACY_WHEN_UNLINKED = new Set<string>([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.VIEWER,
  'vice_chancellor',
  'service_desk_manager',
  'dvc_infrastructure',
  'institutional_viewer',
]);

function normalizeRoleName(name?: string | null): string {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isExcludedRoleName(roleName: string): boolean {
  if (!roleName) return false;
  if (EXCLUDED_NAME_KEYS.has(roleName)) return true;
  if (roleName.includes('super admin')) return true;
  if (roleName === 'admin' || roleName.startsWith('administrator')) return true;
  if (roleName.includes('vice chancellor')) return true;
  if (roleName.includes('dvc infrastructure')) return true;
  if (roleName.includes('institutional viewer')) return true;
  if (roleName.includes('service desk manager')) return true;
  return false;
}

export function isExcludedAssignmentRole(user: User): boolean {
  const formalName = normalizeRoleName(user.role?.name);
  // Prefer the linked Role name — many officers still have legacy `viewer`/`staff`
  // left over from migration and must not be excluded because of that.
  if (formalName) return isExcludedRoleName(formalName);

  const legacy = (user.role_legacy || '').toLowerCase().trim();
  return !!(legacy && EXCLUDED_LEGACY_WHEN_UNLINKED.has(legacy));
}

export function isAssignableDeskUser(user: User): boolean {
  if (!user?.is_active) return false;
  if (isExcludedAssignmentRole(user)) return false;

  const roleName = normalizeRoleName(user.role?.name);
  const legacy = (user.role_legacy || '').toLowerCase();

  if (roleName.includes('student') || legacy === UserRole.STUDENT) return false;
  if (roleName.includes('guest') || legacy.includes('guest')) return false;

  // Anyone with an operational role (or staff link) may be listed under their role group.
  if (user.role?.name) return true;
  if (
    legacy === UserRole.STAFF ||
    legacy === UserRole.FACULTY ||
    legacy === UserRole.HELPDESK
  ) {
    return true;
  }
  return false;
}

export function filterAssignableUsers(users: User[]): User[] {
  return users.filter(isAssignableDeskUser);
}

/** Display label for assignment optgroups. */
export function assignmentRoleLabel(user: User): string {
  const name = (user.role?.name || '').trim();
  if (name) return name;
  const legacy = (user.role_legacy || '').trim();
  if (!legacy) return 'Other Staff';
  return legacy.charAt(0).toUpperCase() + legacy.slice(1).replace(/_/g, ' ');
}
