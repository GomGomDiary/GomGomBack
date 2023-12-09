import { applyDecorators } from '@nestjs/common';
import { ExposeOptions } from 'class-transformer';
import { MongoIdTransfrom } from './mongoIdTransform.decorator';
import 'reflect-metadata';
/**
 * 몽고 아이디 (기댓값을 받아) 비정상일경우 에러메시지.
 * @param fieldName
 * @param options
 * @returns null | mongoIdObject
 */
export function MongoIdValidationTransfrom(options?: ExposeOptions) {
  return applyDecorators(
    // passDecoratedPropertyName(),
    MongoIdTransfrom(options),
  );
}
