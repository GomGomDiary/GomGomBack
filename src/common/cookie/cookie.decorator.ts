import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    // configservice injection이 가능할지,,?
    if (process.env.NODE_ENV === 'development') {
      return request.cookies.diaryUser;
    }
    return request.signedCookies.diaryUser;
  },
);
