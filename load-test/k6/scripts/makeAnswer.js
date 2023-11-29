import http from 'k6/http';
import { sleep, check } from 'k6';
import { SERVER_URL, DIARY_ID, COUNTER_SIGN } from './variable.js';

export const options = {
  stages: [{ duration: '30s', target: 25 }],

  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  const data = {
    countersign: COUNTER_SIGN,
  };
  const res = http.post(`${SERVER_URL}/countersign/${DIARY_ID}`, data);

  check(res, { 'create token': (r) => r.status === 201 });

  const diaryToken = res.json('diaryToken');
  return diaryToken;
}

export default function (diaryToken) {
  const data = {
    answers: ['영석', 12, '연어'],
    answerer: 'yoon',
  };
  const options = {
    headers: {
      Authorization: `Bearer ${diaryToken}`,
    },
  };

  const res = http.post(`${SERVER_URL}/answer/${DIARY_ID}`, data, options);

  check(res, {
    'status is 201': (r) => r.status === 201,
  });
  sleep(1);
}
