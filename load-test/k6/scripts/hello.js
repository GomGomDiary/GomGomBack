import http from 'k6/http';
import { sleep, check } from 'k6';
import { SERVER_URL } from './variable.js';

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

export default function () {
  // const jar = http.cookieJar();
  // jar.set('http://localhost', 'diaryUser', ANSWER_ID, {
  //   domain: 'localhost',
  //   path: '/',
  //   secure: true,
  //   max_age: 600,
  // });

  const res = http.get(`${SERVER_URL}`, {});
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
