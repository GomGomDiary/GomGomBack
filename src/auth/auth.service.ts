import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DiaryRepository } from 'src/common/repositories/diary.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async signIn(diaryId: string, countersignFromClient: string) {
    const user = await this.diaryRepository.findField(diaryId, {
      countersign: 1,
    });
    if (!user) {
      throw new NotFoundException('diaryId가 올바르지 않습니다.');
    }
    if (user.countersign !== countersignFromClient) {
      throw new UnauthorizedException('countersign이 올바르지 않습니다.');
    }

    const payload = { sub: user._id };
    return {
      diaryToken: await this.jwtService.signAsync(payload),
    };
  }

  async createToken(payload: any) {
    return await this.jwtService.signAsync(payload);
  }

  extractTokenFromHeader(header: string) {
    const splitToken = header.split(' ');
    if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
      throw new UnauthorizedException('token이 올바르지 않습니다.');
    }
    const token = splitToken[1];
    return token;
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('token이 올바르지 않습니다.');
    }
  }
}
