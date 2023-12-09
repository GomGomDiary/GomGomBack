import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheInterfaceRepository } from './interfaces/cache.interface';

@Injectable()
export class CacheRepository implements CacheInterfaceRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  async del(target: string) {
    await this.cacheService.del(`/v1/diary/${target}`);
  }

  async keys() {
    return await this.cacheService.store.keys();
  }
}
