import { BadRequestException } from '@nestjs/common';
import { ExposeOptions, Transform } from 'class-transformer';
import mongoose from 'mongoose';

export const MongoIdTransfrom =
  (options?: ExposeOptions) => (target, propertyKey) => {
    Transform(({ value }) => {
      if (!!value && !mongoose.isValidObjectId(value))
        throw new BadRequestException('next parameter가 형식에 맞지 않습니다.');
      return new mongoose.Types.ObjectId(value);
    }, options)(target, propertyKey);
  };
