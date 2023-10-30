import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class CookieCheckPipe implements PipeTransform {
  transform(userId: string) {
    if (!!userId && !mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    return userId;
  }
}
