import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (process.env.NODE_ENV === 'production') {
      return request.signedCookies[data];
    }
    return request.cookies[data];
    // return request.cookies?.[data];
  },
);
