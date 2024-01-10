import { BadRequestException } from '@nestjs/common';
import {
  ExposeOptions,
  Transform,
  TransformationType,
} from 'class-transformer';
import mongoose, { Types } from 'mongoose';

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

export const TransformObjectId: () => PropertyDecorator =
  () => (target: object, propertyKey: string) => {
    Transform(({ type, obj }) => {
      switch (type) {
        case TransformationType.PLAIN_TO_CLASS:
          if (!mongoose.isValidObjectId(obj[propertyKey])) {
            throw new BadRequestException(
              `${propertyKey}가 형식에 맞지 않습니다.`,
            );
          }
          return new Types.ObjectId(obj[propertyKey]);

        case TransformationType.CLASS_TO_PLAIN:
          return obj[propertyKey].toString();

        case TransformationType.CLASS_TO_CLASS:
          return obj[propertyKey];

        default:
          return undefined;
      }
    })(target, propertyKey);
  };
