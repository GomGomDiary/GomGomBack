import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '3m', target: 60 },
    { duration: '3m', target: 200 },
    { duration: '3m', target: 300 },
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

const SERVER_URL = 'http://localhost:8765/v1/diary';

export default function () {
  // const getResponse = http.get(`${SERVER_URL}`);
  //
  // check(getResponse, {
  //   'status is 200': (r) => r.status === 200,
  // });

  const data = {
    question: ['이름', '나이', '좋아하는 음식', '연예인'],
    questioner: 'update 테스트-3',
    challenge: '우리가 만난 날짜',
    countersign: '1219',
  };

  const res = http.post(`${SERVER_URL}/question`, data);

  console.log(res.status);
  check(res, {
    'status is 201': (r) => r.status === 201,
  });
  sleep(1);
}
