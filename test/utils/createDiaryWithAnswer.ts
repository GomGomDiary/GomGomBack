import { INestApplication } from '@nestjs/common';
import { createDiary } from './createDiary';
import { DiaryDataType, clientId1_Answer, clientId2_Answer } from './constants';

import request from 'supertest';

export const createDiaryWithAnswer = async (
  app: INestApplication,
  diaryData: DiaryDataType,
  existedDiaryId?: string,
  existedAnswererId?: string,
) => {
  /**
   * 개요
   * 해당 beforeEach 실행 시
   * question 1개에 answer 2개가 붙어있는 구조를 갖게 됩니다.
   */

  /**
   * question 생성
   */
  const diaryResponse = await createDiary(app, diaryData, existedDiaryId);

  let diaryId: string;
  /**
   * diaryId 파싱
   */
  if (existedDiaryId) {
    diaryId = existedDiaryId;
  } else {
    const diaryIdCookie = diaryResponse.header['set-cookie'][0];

    diaryId = diaryIdCookie
      .match(/diaryUser=.+?;/)[0]
      .slice('diaryUser='.length)
      .replace(/;/g, '');
  }

  /**
   * answerer 인증
   */
  const tokenResponse = await request(app.getHttpServer())
    .post(`/v1/diary/countersign/${diaryId}`)
    .send({
      countersign: 'first',
    });

  /**
   * token 파싱
   */
  const token = tokenResponse.body.diaryToken;

  /**
   * answer1 생성
   */
  let postAnswererPromise;
  if (existedAnswererId) {
    postAnswererPromise = request(app.getHttpServer())
      .post(`/v1/diary/answer/${diaryId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', [`diaryUser=${existedAnswererId}`])
      .send(clientId1_Answer);
  } else {
    postAnswererPromise = request(app.getHttpServer())
      .post(`/v1/diary/answer/${diaryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(clientId1_Answer);
  }
  const firstAnswererResponse = await postAnswererPromise;

  /**
   * answerer1 cookie 파싱
   */
  // example : j%3A"6541cd0ad151bb4d862be09c" => j:"6541cd0ad151bb4d862be09c"
  let clientId1: string;

  if (existedAnswererId) {
    clientId1 = existedAnswererId;
  } else {
    const clientCookie = firstAnswererResponse.header['set-cookie'][0];
    clientId1 = clientCookie
      .match(/diaryUser=.+?;/)[0]
      .slice('diaryUser='.length)
      .replace(/;/g, '');
  }
  /**
   * answer2 생성
   */
  const secondAnswererResponse = await request(app.getHttpServer())
    .post(`/v1/diary/answer/${diaryId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(clientId2_Answer);

  /**
   * cookie 파싱
   */
  const cookie = secondAnswererResponse.header['set-cookie'][0];
  const clientId2 = cookie
    .match(/diaryUser=.+?;/)[0]
    .slice('diaryUser='.length)
    .replace(/;/g, '');

  return {
    diaryId,
    clientId1,
    clientId2,
    token,
  };
};
