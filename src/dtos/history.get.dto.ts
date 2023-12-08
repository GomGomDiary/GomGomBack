import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { MongoIdTransfrom } from 'src/common/decorators/mongoIdTransform.decorator';
import { TransformObjectIdToString } from 'src/common/decorators/transformObjectIdToString.decorator';
import { PaginateAnswererDto } from 'src/dtos/answerer.get.dto';
import { DiaryHistory } from 'src/entities/diaryHistory.schema';

export class HistoryItemGetDto extends OmitType(DiaryHistory, ['updatedAt']) {}

export class HistoryGetDto extends PickType(DiaryHistory, [
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
  @TransformObjectIdToString('nextDiaryId', { toPlainOnly: true })
  @Transform((value) => value.obj.next, { toClassOnly: true })
  next: Types.ObjectId;
}

export class PaginateHistoryDto extends PickType(PaginateAnswererDto, [
  'take',
]) {
  @ApiProperty({
    example: '12341234',
    description: 'mongodb id',
    required: true,
  })
  @IsOptional()
  @MongoIdTransfrom({ toClassOnly: true })
  next: Types.ObjectId | undefined;
}

// export class HistoryGetListDto extends HistoryGetDto[] {}
