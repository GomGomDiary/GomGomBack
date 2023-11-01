import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (process.env.NODE_ENV === 'development') {
      return request.cookies[data];
    }
    return request.signedCookies[data];
  },
);
