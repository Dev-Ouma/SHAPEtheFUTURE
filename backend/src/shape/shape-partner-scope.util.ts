import { SelectQueryBuilder } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

/** Restrict WP queries to packages led by or listing the partner. */
export function applyPartnerWorkPackageScope<T extends { leader_partner_id?: string | null; partner_ids?: string[] }>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  partnerScopeId?: string | null,
) {
  if (!partnerScopeId) return qb;
  return qb.andWhere(
    `(${alias}.leader_partner_id = :partnerScopeId OR CAST(${alias}.partner_ids AS text) ILIKE :partnerLike)`,
    {
      partnerScopeId,
      partnerLike: `%${partnerScopeId}%`,
    },
  );
}

export function assertConsortiumCoordinator(partnerScopeId?: string | null) {
  if (partnerScopeId) {
    throw new ForbiddenException(
      'Only consortium coordinators can manage this consortium-wide record.',
    );
  }
}

export function partnerOwnsWorkPackage(
  wp: { leader_partner_id?: string | null; partner_ids?: string[] | null },
  partnerScopeId: string,
): boolean {
  if (wp.leader_partner_id === partnerScopeId) return true;
  const ids = Array.isArray(wp.partner_ids) ? wp.partner_ids : [];
  return ids.includes(partnerScopeId);
}
