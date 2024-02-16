import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { MongooseModule } from '@nestjs/mongoose';
import { History } from 'src/models/history.schema';
import { HistoryRepository } from './history.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'History', schema: History }])],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
