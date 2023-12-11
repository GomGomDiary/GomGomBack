import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { toKoreaTime } from 'src/utils/toKoreaTime';
import { sendWebhook } from 'src/utils/webhook';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const logger = new Logger();
    const error = exception.getResponse();
    const now = new Date();

    let user = request.cookies.diaryUser;
    if (process.env.NODE_ENV === 'production') {
      user = request.signedCookies.diaryUser;
    }

    const userInform = `[${request.method}] ${request.url} ${user}`;
    logger.warn(`[${request.method}] ${request.url}   ${user}`);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      await sendWebhook(error, userInform);
      logger.error(error);
    }
    if (typeof error === 'string') {
      return response.status(status).json({
        statusCode: status,
        timestampUtc: now.toISOString().replace('Z', ''),
        timestampKst: toKoreaTime(now),
        path: request.url,
      });
    }

    response.status(status).json({
      statusCode: status,
      timestampUtc: now.toISOString().replace('Z', ''),
      timestampKst: toKoreaTime(now),
      path: request.url,
    });
  }
}
