import { PickType } from '@nestjs/swagger';
import { Diary } from '../entities/diary.schema';

export class CountersignPostDto extends PickType(Diary, ['countersign']) {}
