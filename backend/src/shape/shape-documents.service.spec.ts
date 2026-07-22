import { ShapeDocumentsService } from './shape-documents.service';

describe('ShapeDocumentsService publish filter', () => {
  function makeService(getManyImpl: () => Promise<any[]>) {
    const qb: any = {
      leftJoinAndSelect: () => qb,
      orderBy: () => qb,
      andWhere: jest.fn().mockReturnThis(),
      where: () => qb,
      getMany: getManyImpl,
      getOne: async () => null,
    };
    const repo = {
      createQueryBuilder: jest.fn(() => qb),
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => x),
      remove: jest.fn(),
    };
    const service = new ShapeDocumentsService(repo as any);
    return { service, qb, repo };
  }

  it('public findAll filters is_published and is_public', async () => {
    const { service, qb } = makeService(async () => []);
    await service.findAll(false);
    const wheres = qb.andWhere.mock.calls.map((c: any[]) => String(c[0]));
    expect(wheres.some((w: string) => w.includes('is_published'))).toBe(true);
    expect(wheres.some((w: string) => w.includes('is_public'))).toBe(true);
  });

  it('admin findAll does not force publish filter', async () => {
    const { service, qb } = makeService(async () => [{ id: '1' }]);
    await service.findAll(true);
    const wheres = qb.andWhere.mock.calls.map((c: any[]) => String(c[0]));
    expect(wheres.some((w: string) => w.includes('is_published'))).toBe(false);
  });
});
