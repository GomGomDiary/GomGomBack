import { Module, forwardRef } from '@nestjs/common';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DiaryRepository } from './diary.repository';
import { ConfigModule } from '@nestjs/config';
import config from 'src/config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { Diary, DiarySchema } from 'src/entity/diary.schema';

@Module({
  imports: [
    JwtModule,
    ConfigModule.forRoot({
      load: [config],
      envFilePath: `./.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forFeature([{ name: Diary.name, schema: DiarySchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DiaryController],
  providers: [DiaryService, DiaryRepository],
  exports: [DiaryRepository],
})
export class DiaryModule {}
