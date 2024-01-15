import { Module, forwardRef } from '@nestjs/common';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DiaryRepository } from '../common/repositories/diary.repository';
import { ConfigModule } from '@nestjs/config';
import config from 'src/config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Diary, DiarySchema } from 'src/models/diary.schema';
import { HistorySchema, History } from 'src/models/history.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheRepository } from '../common/repositories/cache.repository';
import { CustomInternalServerError } from 'src/common/errors/customError';

@Module({
  imports: [
    JwtModule,
    ConfigModule.forRoot({
      load: [config],
      envFilePath: `./.env.${process.env.NODE_ENV}`,
    }),
    CacheModule.register(),
    MongooseModule.forFeature([
      { name: Diary.name, schema: DiarySchema },
      { name: History.name, schema: HistorySchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DiaryController],
  providers: [DiaryService, DiaryRepository, CacheRepository],
  exports: [DiaryRepository],
})
export class DiaryModule {}
