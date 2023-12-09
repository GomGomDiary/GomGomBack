import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EmptyPipe implements PipeTransform {
  transform(userId: undefined) {
    if (!userId) {
      throw new BadRequestException('diarayUser 쿠키가 존재하지 않습니다.');
    }
    return userId;
  }
}
