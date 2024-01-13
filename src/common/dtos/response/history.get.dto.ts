import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { HistoryDto } from '../history.dto';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { CursorPaginationQueryDto } from '../request/pagination.dto';
import { IsOptional } from 'class-validator';
import { TransformStringToObjectId } from 'src/common/decorators/mongoIdTransform.decorator';
import { PaginateAnswererDto } from 'src/common/dtos/response/answerer.get.dto';

export class HistoryItemGetDto extends OmitType(HistoryDto, [
  'updatedAt',
  'countersign',
]) {
  @ApiProperty({
    example: '0120',
    description: '암호에 대한 답',
    required: true,
  })
  @Expose()
  countersign: string;
}

export class HistoryGetDto extends PickType(HistoryDto, [
  '_id',
  'createdAt',
  'numberOfAnswerers',
]) {}

export class HistoryGetListDto {
  @ApiProperty({
    example: [
      {
        _id: '654ba13be9664d0e9b7a82fa',
        createdAt: '2023-11-08T14:54:51.929Z',
        numberOfAnswerers: 1,
      },
      {
        _id: '654e83cf8e4dec550733931c',
        createdAt: '2023-11-15T15:43:45.050Z',
        numberOfAnswerers: 2,
      },
    ],
  })
  @Expose()
  @Type(() => HistoryGetDto)
  historyList: HistoryGetDto[];

  @Expose()
  @Type(() => Types.ObjectId)
  @TransformObjectIdToString('', { toPlainOnly: true })
  @Transform(
    (value) => {
      return value.obj.next;
    },
    { toClassOnly: true },
  )
  next: Types.ObjectId;
}

export class PaginateHistoryDto extends PickType(CursorPaginationQueryDto, [
  'next',
  'take',
]) {}
// export class PaginateHistoryDto extends PickType(PaginateAnswererDto, [
//   'take',
// ]) {
//   @ApiProperty({
//     example: '654ba13be9664d0e9b7a82fa',
//     description: 'mongo id',
//     required: true,
//   })
//   @IsOptional()
//   @TransformStringToObjectId({ toClassOnly: true })
//   next: Types.ObjectId | undefined;
// }
