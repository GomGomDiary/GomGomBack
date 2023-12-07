import http from 'k6/http';
import { sleep, check } from 'k6';
import { SERVER_URL, DIARY_ID } from './variable.js';
import { getAnswer } from './getDiaryAnswererAndAnswer.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '3m', target: 138 },
    { duration: '2m', target: 10 },
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  const data = {
    countersign: '1219',
  };
  const res = http.post(`${SERVER_URL}/countersign/${DIARY_ID}`, data, {
    tags: {
      page_name: 'countersign',
    },
  });

  check(res, { 'create token': (r) => r.status === 201 });

  const diaryToken = res.json('diaryToken');
  return diaryToken;
}

export default function (diaryToken) {
  // const jar = http.cookieJar();
  // jar.set('http://localhost', 'diaryUser', ANSWER_ID, {
  //   domain: 'localhost',
  //   path: '/',
  //   secure: true,
  //   max_age: 600,
  // });
  getAnswer(diaryToken);
  sleep(1);
}
