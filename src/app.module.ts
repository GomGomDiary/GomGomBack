import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DiaryModule } from './diary/diary.module';

@Module({
  imports: [ConfigModule.forRoot(), DiaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
