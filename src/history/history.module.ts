import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DiaryHistory } from 'src/entities/diaryHistory.schema';
import { HistoryRepository } from './repository/history.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'DiaryHistory', schema: DiaryHistory }]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
