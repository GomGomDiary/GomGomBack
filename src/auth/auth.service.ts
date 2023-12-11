import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DiaryRepository } from 'src/common/repositories/diary.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly jwtService: JwtService,
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
}
