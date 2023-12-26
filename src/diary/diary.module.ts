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
import {
  DiaryHistorySchema,
  DiaryHistory,
} from 'src/models/diaryHistory.schema';
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
    MongooseModule.forFeatureAsync([
      {
        name: Diary.name,
        inject: [getModelToken(DiaryHistory.name)],
        imports: [
          MongooseModule.forFeature([
            { name: DiaryHistory.name, schema: DiaryHistorySchema },
          ]),
        ],
        useFactory: async (diaryHistoryModel) => {
          const schema = DiarySchema;
          schema.pre('updateOne', async function () {
            const retentionDiary = await this.model
              .findOne(this.getQuery())
              .lean<Diary>()
              .exec();
            if (!retentionDiary) {
              throw new CustomInternalServerError({
                where: 'preUpdateOne',
                information: {
                  query: 'findOne',
                },
                err: 'retentionDiary is undefined',
              });
            }
            const diaryId = retentionDiary._id;

            retentionDiary.createdAt = retentionDiary.updatedAt;
            const numberOfAnswerers = retentionDiary.answerList.length;

            const refinedRetentionDiary = {
              ...retentionDiary,
            } as Partial<Diary>;
            delete refinedRetentionDiary._id;
            delete refinedRetentionDiary.updatedAt;

            await diaryHistoryModel.create({
              ...retentionDiary,
              diaryId,
              numberOfAnswerers,
            });
          });
          return schema;
        },
      },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [DiaryController],
  providers: [DiaryService, DiaryRepository, CacheRepository],
  exports: [DiaryRepository],
})
export class DiaryModule {}
