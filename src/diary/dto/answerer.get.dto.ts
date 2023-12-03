import { ApiProperty, PickType } from '@nestjs/swagger';
import { Answer, Diary } from '../../entity/diary.schema';
import { Expose, Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DEFAULT_PAGINATE } from 'src/utils/constants';

class AnswerWithPermission extends PickType(Answer, [
  '_id',
  'answerer',
  'createdAt',
  'updatedAt',
]) {}

export class AnswererGetDto extends PickType(Diary, ['_id', 'questioner']) {
  @ApiProperty({
    example: [
      {
        _id: '654ba13be9664d0e9b7a82fa',
        answerer: 'yoon',
        createdAt: '2023-11-08T14:54:51.929Z',
        updatedAt: '2023-11-08T14:54:51.929Z',
      },
      {
        _id: '654e83cf8e4dec550733931c',
        answerer: 'yoon',
        createdAt: '2023-11-15T15:43:45.050Z',
        updatedAt: '2023-11-15T15:43:45.050Z',
      },
    ],
  })
  @Type(() => AnswerWithPermission)
  @Expose()
  answererList: AnswerWithPermission[];

  @ApiProperty({
    example: 46,
  })
  @Expose()
  answerCount: number;
}

@ValidatorConstraint({ name: 'IsStartMultipleOfFive', async: false })
export class IsStartMultipleofFive implements ValidatorConstraintInterface {
  validate(start: number, args: ValidationArguments) {
    return start % 5 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'must be a multiple of 5.';
  }
}

@ValidatorConstraint({ name: 'IsEndMultipleOfFive', async: false })
export class IsEndMultipleofFive implements ValidatorConstraintInterface {
  validate(end: number, args: ValidationArguments) {
    console.log(end, typeof end);
    return end % 5 === 0 && end !== 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'must be a multiple of 5 and not 0.';
  }
}

@ValidatorConstraint({ async: false })
export class IsGraterThanStart implements ValidatorConstraintInterface {
  validate(end: number, args: ValidationArguments) {
    const object = args.object as PaginateAnswererDto;
    console.log(object);
    console.log(end);
    return end % 5 === 0 && end !== 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'must be a multiple of 5 and not 0.';
  }
}

export class PaginateAnswererDto {
  @IsNumber()
  @Validate(IsStartMultipleofFive)
  start: number;

  @IsNumber()
  @IsIn(DEFAULT_PAGINATE)
  // @Validate(IsEndMultipleofFive)
  // @Validate(IsGraterThanStart)
  take: number;
}
