import { createParamDecorator } from '@nestjs/common';
import {
  Aspect,
  LazyDecorator,
  WrapParams,
  createDecorator,
} from '@toss/nestjs-aop';

export const COOKIE = Symbol('COOKIETEST');

@Aspect(COOKIE)
export class CookieDecorator implements LazyDecorator {
  constructor() {
    console.log('=== start ===');
  }

  wrap({ method }: WrapParams) {
    return async (...args: any) => {
      console.log(process.env);
      method(...args); // 원래 메소드 실행
    };
  }
}
