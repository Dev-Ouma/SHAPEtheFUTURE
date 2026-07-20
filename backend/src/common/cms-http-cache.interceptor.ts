import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { CMS_CACHE_PREFIX } from './cms-cache.constants';

/**
 * Prefixes Nest HTTP cache keys so CMS invalidation can target them reliably
 * while still including path + query (locale, pagination, filters).
 */
@Injectable()
export class CmsHttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context);
    if (!key) return undefined;
    if (key.startsWith(CMS_CACHE_PREFIX)) return key;
    return `${CMS_CACHE_PREFIX}${key}`;
  }
}
