import { PickType } from '@nestjs/swagger';
import { Diary } from '../diary.schema';

export class CountersignPostDto extends PickType(Diary, ['countersign']) {}
