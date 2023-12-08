import { Test, TestingModule } from '@nestjs/testing';
import { HttpCacheInterceptor } from './cache.interceptor';
import { CacheInterceptor, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { of } from 'rxjs';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpCacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: {
            store: {},
          } as Cache,
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    interceptor = module.get<HttpCacheInterceptor>(HttpCacheInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  // describe('trackBy', () => {
  //   it('should return originalUrl if path includes answerers', () => {
  //     const url = '/api/answerers';
  //     const req = { path: url, originalUrl: url } as Request;
  //     mockExecutionContext.switchToHttp().getRequest.mockReturnValue(req);
  //
  //     expect(
  //       interceptor.trackBy(
  //         mockExecutionContext as unknown as ExecutionContext,
  //       ),
  //     ).toBe(url);
  //   });
  //
  //   it('should return path if path does not include answerers', () => {
  //     const url = '/api/questions';
  //     const req = { path: url, originalUrl: url } as Request;
  //     mockExecutionContext.switchToHttp().getRequest.mockReturnValue(req);
  //
  //     expect(
  //       interceptor.trackBy(
  //         mockExecutionContext as unknown as ExecutionContext,
  //       ),
  //     ).toBe(url);
  //   });
  // });
  //
  // describe('intercept', () => {
  //   it('should call next.handle() and return its result', async () => {
  //     const handler = {
  //       handle: jest.fn().mockReturnValue(of('test')),
  //     };
  //
  //     await expect(
  //       interceptor.intercept(
  //         mockExecutionContext as unknown as ExecutionContext,
  //         handler,
  //       ),
  //     ).resolves.toBe('test');
  //   });
  // });
});
