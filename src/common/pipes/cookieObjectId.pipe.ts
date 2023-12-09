import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoDBIdPipe implements PipeTransform {
  transform(userId: string | false) {
    /**
     * when cookie signature validation failed, userId got false
     */
    if (
      userId === false ||
      (!!userId && !mongoose.Types.ObjectId.isValid(userId))
    ) {
      throw new BadRequestException('diaryUser 쿠키가 형식에 맞지 않습니다.');
    }
    return userId;
  }
}
