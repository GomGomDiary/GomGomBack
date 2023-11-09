import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const logger = new Logger();

    let user = request.cookies.diaryUser;
    if (process.env.NODE_ENV === 'production') {
      user = request.signedCookies.diaryUser;
    }

    logger.error(`[${request.method}] ${request.url} ${user}`);
    const now = new Date();
    const koreaTimeDiff = 9 * 60 * 60 * 1000;
    const error = exception.getResponse();

    if (typeof error === 'string') {
      return response.status(status).json({
        statusCode: status,
        error,
        timestampUtc: now.toISOString().replace('Z', ''),
        timestampKst: new Date(now.getTime() + koreaTimeDiff)
          .toISOString()
          .replace('Z', ''),
        path: request.url,
      });
    }
    response.status(status).json({
      statusCode: status,
      ...error,
      timestampUtc: now.toISOString().replace('Z', ''),
      timestampKst: new Date(now.getTime() + koreaTimeDiff)
        .toISOString()
        .replace('Z', ''),
      path: request.url,
    });
  }
}
