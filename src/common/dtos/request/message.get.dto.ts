import { PickType } from '@nestjs/swagger';
import { CursorPaginationQueryDto } from './pagination.dto';

export class PaginateMessageDto extends PickType(CursorPaginationQueryDto, [
  'take',
  'next',
]) {}
