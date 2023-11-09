import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DiaryRepository } from 'src/diary/diary.repository';

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
    if (user.countersign !== countersignFromClient) {
      throw new UnauthorizedException('Invalid countersign');
    }

    const payload = { sub: user._id };
    return {
      diaryToken: await this.jwtService.signAsync(payload),
    };
  }
}
