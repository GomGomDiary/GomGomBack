import { PickType } from '@nestjs/swagger';
import { Diary } from '../../models/diary.schema';

export class CountersignPostDto extends PickType(Diary, ['countersign']) {}
