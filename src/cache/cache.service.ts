import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheService: Cache) {}

  async get(target: string) {
    return await this.cacheService.get(`/v1/diary/${target}`);
  }

  async del(target: string) {
    await this.cacheService.del(`/v1/diary/${target}`);
  }

  async keys() {
    return await this.cacheService.store.keys();
  }

  // async set(key: string, value: any) {
  //   await this.cacheService.set(`/v1/diary/${key}`, value);
  // }
}
