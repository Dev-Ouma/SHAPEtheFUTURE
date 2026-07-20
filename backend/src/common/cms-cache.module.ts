import { Global, Module } from '@nestjs/common';
import { CmsCacheService } from './cms-cache.service';
import { CmsHttpCacheInterceptor } from './cms-http-cache.interceptor';

@Global()
@Module({
  providers: [CmsCacheService, CmsHttpCacheInterceptor],
  exports: [CmsCacheService, CmsHttpCacheInterceptor],
})
export class CmsCacheModule {}
