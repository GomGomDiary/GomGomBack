import http from 'k6/http';
import { sleep, check } from 'k6';

const SERVER_URL = 'http://localhost:8765/v1/diary';
const DIARY_ID = '6566281fc2e7156074d029cc';
const ANSWER_ID = '656705d8bfcc00e319c25f28';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    // { duration: '3m', target: 300 },
    //{ duration: '3m', target: 138 },
    // { duration: '30s', target: 0 },
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

function getAnswerer() {
  const answererResponse = http.get(`${SERVER_URL}/answerers/${DIARY_ID}`, {
    tags: {
      page_name: 'answer',
    },
  });

  check(answererResponse, {
    'answerer Response': (r) => r.status === 200,
  });
}

function getAnswer(diaryToken) {
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
