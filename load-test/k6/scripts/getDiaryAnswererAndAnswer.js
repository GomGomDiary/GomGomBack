import http from 'k6/http';
import { sleep, check } from 'k6';
import { SERVER_URL, ANSWER_ID, DIARY_ID } from './variable.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 100 },
    { duration: '3m', target: 138 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
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

export function getAnswerer() {
  const answererResponse = http.get(
    `${SERVER_URL}/answerers/${DIARY_ID}?start=0&take=5`,
    {
      tags: {
        page_name: 'answer',
      },
    },
  );

  check(answererResponse, {
    'answerer Response': (r) => r.status === 200,
  });
}

export function getAnswer(diaryToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${diaryToken}`,
      cookie: `diaryUser=${ANSWER_ID}`,
    },
    tags: {
      page_name: 'answerer',
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

export default function (diaryToken) {
  // const jar = http.cookieJar();
  // jar.set('http://localhost', 'diaryUser', ANSWER_ID, {
  //   domain: 'localhost',
  //   path: '/',
  //   secure: true,
  //   max_age: 600,
  // });

  getAnswerer();
  sleep(1);
  getAnswer(diaryToken);
}
