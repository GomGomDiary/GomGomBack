import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AnswerGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const { diaryId, answerId } = req.params;
    const clientId = this.getClientId(req);

    if (clientId !== diaryId && clientId !== answerId) {
      throw new UnauthorizedException('diaryId가 올바르지 않습니다.');
    }
    return true;
  }

  private getClientId(req: Request) {
    const env = this.configService.get('NODE_ENV');
    if (env === 'production') {
      return req.signedCookies['diaryUser'];
    }
    return req.cookies['diaryUser'];
  }
}
