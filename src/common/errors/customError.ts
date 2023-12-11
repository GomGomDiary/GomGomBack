import {
  HttpExceptionOptions,
  InternalServerErrorException,
} from '@nestjs/common';

export interface CustomErrorOptions {
  information: object;
  where: string;
  err: any;
}

export class CustomInternalServerError extends InternalServerErrorException {
  constructor(
    objectOrError: string | CustomErrorOptions,
    description?: string | HttpExceptionOptions,
  ) {
    super(objectOrError, description);
  }
}
