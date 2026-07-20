import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CMS_CACHE_PREFIX } from './cms-cache.constants';

/**
 * Invalidates Nest CmsHttpCacheInterceptor entries after CMS writes.
 * Keys look like: cms:/menus?position=header&locale=en
 */
@Injectable()
export class CmsCacheService {
  private readonly logger = new Logger(CmsCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async invalidateMenus(): Promise<void> {
    await this.invalidateSegments(['/menus']);
  }

  async invalidateSettings(): Promise<void> {
    await this.invalidateSegments(['/settings/public']);
  }

  async invalidateHeroSlides(): Promise<void> {
    await this.invalidateSegments(['/hero-slides']);
  }

  async invalidateSchools(): Promise<void> {
    await this.invalidateSegments(['/schools']);
  }

  async invalidateProgrammes(): Promise<void> {
    await this.invalidateSegments(['/programmes']);
  }

  async invalidatePages(): Promise<void> {
    await this.invalidateSegments(['/pages']);
  }

  async invalidateNews(): Promise<void> {
    await this.invalidateSegments(['/news']);
  }

  async invalidateMaintenance(): Promise<void> {
    await this.invalidateSegments(['/maintenance/status']);
  }

  private async invalidateSegments(segments: string[]): Promise<void> {
    try {
      const deleted = await this.deleteByPattern(segments);
      if (deleted > 0) {
        this.logger.debug(
          `Invalidated ${deleted} cache key(s) for ${segments.join(', ')}`,
        );
        return;
      }
      await this.deleteExact(this.knownKeysFor(segments));
    } catch (err) {
      this.logger.warn(
        `CMS cache invalidate failed (${segments.join(', ')}): ${(err as Error).message}`,
      );
    }
  }

  private async deleteByPattern(segments: string[]): Promise<number> {
    const store: any =
      (this.cache as any).store ?? (this.cache as any).stores?.[0];
    if (!store || typeof store.keys !== 'function') return 0;

    let count = 0;
    for (const segment of segments) {
      const patterns = [
        `${CMS_CACHE_PREFIX}*${segment}*`,
        `*${CMS_CACHE_PREFIX}*${segment}*`,
      ];
      for (const pattern of patterns) {
        const keys: string[] = (await store.keys(pattern)) || [];
        await Promise.all(
          keys.map(async (key) => {
            await this.cache.del(key);
            count += 1;
          }),
        );
      }
    }
    return count;
  }

  private async deleteExact(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.cache.del(key);
        } catch {
          /* ignore missing keys */
        }
      }),
    );
  }

  private knownKeysFor(segments: string[]): string[] {
    const locales = ['en', 'sw'];
    const keys = new Set<string>();
    const add = (path: string) => {
      keys.add(`${CMS_CACHE_PREFIX}${path}`);
      // Legacy unprefixed keys (pre-interceptor rollout)
      keys.add(path);
    };

    for (const segment of segments) {
      add(segment);
      for (const locale of locales) {
        add(`${segment}?locale=${locale}`);
      }

      if (segment === '/menus') {
        for (const position of ['header', 'top_header', 'footer']) {
          add(`${segment}?position=${position}`);
          for (const locale of locales) {
            add(`${segment}?position=${position}&locale=${locale}`);
            add(`${segment}?locale=${locale}&position=${position}`);
          }
        }
      }

      if (segment === '/pages') {
        add('/pages/categories');
        add('/pages/slug');
        for (const locale of locales) {
          add(`/pages?locale=${locale}`);
          add(`/pages/categories?locale=${locale}`);
          add(`/pages/slug?locale=${locale}`);
        }
      }

      if (
        segment === '/programmes' ||
        segment === '/news' ||
        segment === '/schools'
      ) {
        add(`${segment}?page=1`);
        add(`${segment}?limit=10`);
        add(`${segment}?limit=3`);
        add(`${segment}?limit=4`);
        add(`${segment}?limit=5`);
        add(`${segment}?limit=20`);
        for (const locale of locales) {
          add(`${segment}?page=1&locale=${locale}`);
          add(`${segment}?locale=${locale}&page=1`);
          add(`${segment}?limit=3&type=All&locale=${locale}`);
          add(`${segment}?type=All&limit=3&locale=${locale}`);
          add(`${segment}?type=Research&limit=4&locale=${locale}`);
          add(`${segment}?limit=4&type=Research&locale=${locale}`);
          add(`${segment}?locale=${locale}`);
        }
      }
    }

    return [...keys];
  }
}
