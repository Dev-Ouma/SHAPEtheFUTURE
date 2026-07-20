import { Repository, ObjectLiteral } from 'typeorm';

/**
 * Generates sequential reference numbers: OUK-{PREFIX}-{YYYY}-{NNNN}
 */
export async function generateReferenceNumber(
  repo: Repository<ObjectLiteral>,
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await repo.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `OUK-${prefix}-${year}-${sequence}`;
}
