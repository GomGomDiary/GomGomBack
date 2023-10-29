import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiaryModule } from './diary/diary.module';

import config from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { AopModule } from '@toss/nestjs-aop';
import { CookieDecorator } from './common/cookie/cookie-test.decorator';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: `./.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    DiaryModule,
    AopModule,
  ],
  controllers: [AppController],
  providers: [AppService, CookieDecorator],
})
export class AppModule {}
