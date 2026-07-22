import {
  applyPartnerWorkPackageScope,
  assertConsortiumCoordinator,
  partnerOwnsWorkPackage,
} from './shape-partner-scope.util';
import { ForbiddenException } from '@nestjs/common';

describe('shape-partner-scope.util', () => {
  it('partnerOwnsWorkPackage matches leader', () => {
    expect(
      partnerOwnsWorkPackage(
        { leader_partner_id: 'p1', partner_ids: [] },
        'p1',
      ),
    ).toBe(true);
  });

  it('partnerOwnsWorkPackage matches partner_ids', () => {
    expect(
      partnerOwnsWorkPackage(
        { leader_partner_id: 'other', partner_ids: ['p1', 'p2'] },
        'p1',
      ),
    ).toBe(true);
  });

  it('partnerOwnsWorkPackage rejects outsiders', () => {
    expect(
      partnerOwnsWorkPackage(
        { leader_partner_id: 'other', partner_ids: ['p2'] },
        'p1',
      ),
    ).toBe(false);
  });

  it('assertConsortiumCoordinator blocks partner-scoped users', () => {
    expect(() => assertConsortiumCoordinator('partner-uuid')).toThrow(
      ForbiddenException,
    );
  });

  it('assertConsortiumCoordinator allows global admins', () => {
    expect(() => assertConsortiumCoordinator(null)).not.toThrow();
    expect(() => assertConsortiumCoordinator(undefined)).not.toThrow();
  });

  it('applyPartnerWorkPackageScope adds where clause when scoped', () => {
    const calls: any[] = [];
    const qb = {
      andWhere: (...args: any[]) => {
        calls.push(args);
        return qb;
      },
    } as any;
    applyPartnerWorkPackageScope(qb, 'wp', 'abc');
    expect(calls.length).toBe(1);
    expect(calls[0][1]).toEqual({
      partnerScopeId: 'abc',
      partnerLike: '%abc%',
    });
  });

  it('applyPartnerWorkPackageScope is a no-op without scope', () => {
    const calls: any[] = [];
    const qb = {
      andWhere: (...args: any[]) => {
        calls.push(args);
        return qb;
      },
    } as any;
    applyPartnerWorkPackageScope(qb, 'wp', null);
    expect(calls.length).toBe(0);
  });
});
