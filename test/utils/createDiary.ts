import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DiaryDataType } from './constants';

export const createDiary = async (
  app: INestApplication,
  diaryData: DiaryDataType,
  cookie?: string,
) => {
  const req = request(app.getHttpServer())
    .post('/v1/diary/question')
    .send(diaryData);

  if (cookie) {
    req.set('Cookie', [`diaryUser=${cookie}`]);
  }
  return await req;
};
