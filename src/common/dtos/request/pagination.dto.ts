import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';
import { TransformStringToObjectId } from 'src/common/decorators/mongoIdTransform.decorator';
import { DEFAULT_PAGINATE, SORT_ORDER } from 'src/utils/constants';

@ValidatorConstraint({ name: 'IsStartMultipleOfFive', async: false })
export class IsStartMultipleofFive implements ValidatorConstraintInterface {
  validate(start: number, args: ValidationArguments) {
    return start % 5 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'start must be a multiple of 5.';
  }
}

export class PagePaginationQueryDto {
  @ApiProperty({
    example: 0,
    description: 'start number',
  })
  @IsNumber()
  @Validate(IsStartMultipleofFive)
  start: number;

  @ApiProperty({
    example: 5,
    description: 'take number',
  })
  @IsIn(DEFAULT_PAGINATE)
  @IsNumber()
  take: number;

  @ApiProperty({
    example: 'desc',
    description: 'sort order',
  })
  @IsIn(SORT_ORDER)
  sortOrder = 'desc';
}

export class CursorPaginationQueryDto extends PickType(PagePaginationQueryDto, [
  'take',
]) {
  @ApiProperty({
    example: '654ba13be9664d0e9b7a82fa',
    description: 'mongo id',
    required: true,
  })
  @IsOptional()
  @TransformStringToObjectId({ toClassOnly: true })
  next: Types.ObjectId | undefined;
}
