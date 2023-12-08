import { PickType } from '@nestjs/swagger';
import { Diary } from '../entity/diary.schema';

export class CountersignPostDto extends PickType(Diary, ['countersign']) {}
