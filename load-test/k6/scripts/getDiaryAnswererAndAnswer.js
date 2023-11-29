import http from 'k6/http';
import { sleep, check } from 'k6';
import { SERVER_URL, ANSWER_ID, DIARY_ID } from './variable.js';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '3m', target: 100 },
    { duration: '3m', target: 138 },
    { duration: '3m', target: 138 },
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  const data = {
    countersign: '1219',
  };
  const res = http.post(`${SERVER_URL}/countersign/${DIARY_ID}`, data);

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

  const answererResponse = http.get(`${SERVER_URL}/answerers/${DIARY_ID}`);

  check(answererResponse, {
    'answerer Response': (r) => r.status === 200,
  });

  sleep(0.5);
  const options = {
    headers: {
      Authorization: `Bearer ${diaryToken}`,
      cookie: `diaryUser=${ANSWER_ID}`,
    },
  };

  const answerResponse = http.get(
    `${SERVER_URL}/answer/${DIARY_ID}/${ANSWER_ID}`,
    options,
  );
  check(answerResponse, {
    'answer Response': (r) => r.status === 200,
  });
}
