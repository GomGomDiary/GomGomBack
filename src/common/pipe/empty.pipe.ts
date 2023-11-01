import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EmptyPipe implements PipeTransform {
  transform(userId: undefined) {
    if (!userId) {
      throw new BadRequestException('Invalid user id');
    }
    return userId;
  }
}
