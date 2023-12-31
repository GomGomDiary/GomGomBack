import { PickType } from '@nestjs/swagger';
import { DiaryDto } from './diary.dto';

export class CountersignPostDto extends PickType(DiaryDto, ['countersign']) {}
