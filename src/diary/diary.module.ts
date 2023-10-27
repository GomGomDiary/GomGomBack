import { Module } from '@nestjs/common';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DiarySchema } from './diary.schema';
import { Diary } from './diary.schema';
import { DiaryRepository } from './diary.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Diary.name, schema: DiarySchema }]),
  ],
  controllers: [DiaryController],
  providers: [DiaryService, DiaryRepository],
})
export class DiaryModule {}
