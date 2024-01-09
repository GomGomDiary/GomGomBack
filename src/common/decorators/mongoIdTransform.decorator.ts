import { BadRequestException } from '@nestjs/common';
import { ExposeOptions, Transform } from 'class-transformer';
import mongoose from 'mongoose';

export const TransformStringToObjectId =
  (options?: ExposeOptions) => (target: any, propertyKey: string) => {
    Transform(({ value }) => {
      if ((!!value && !mongoose.isValidObjectId(value)) || value === '') {
        throw new BadRequestException(`${propertyKey}가 형식에 맞지 않습니다.`);
      }
      if (value === undefined) {
        return value;
      }
      return new mongoose.Types.ObjectId(value);
    }, options)(target, propertyKey);
  };
