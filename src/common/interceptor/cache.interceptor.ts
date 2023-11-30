import {
  CacheInterceptor,
  CallHandler,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
// import { ANSWERERS, QUESTION } from 'src/utils/constants';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string {
    const req = context.switchToHttp().getRequest<Request>();
    return req.path;
  }

  private readonly CACHE_EVICT_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();

    if (this.CACHE_EVICT_METHODS.includes(req.method)) {
      return next.handle().pipe(tap(() => this.cacheManager.del(req.path)));
    }
    console.log(`Cache hit: ${req.originalUrl}`);

    return super.intercept(context, next);
  }
}
