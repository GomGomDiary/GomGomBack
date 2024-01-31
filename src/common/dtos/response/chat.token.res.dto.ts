import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChatTokenShowDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTRiYTA4ZGU5NjY0ZDBlOWI3YTgyZjciLCJpYXQiOjE2OTk1MzY2ODIsImV4cCI6MTY5OTU0MDI4Mn0.NoNhAFSkSWc9FYduBApS_-X2ODDGlkGwR7FBZ4DZw',
    description: '채팅 진입시 발급되는  토큰',
    required: true,
  })
  @Expose()
  chatToken: string;
}
