import { KOREAN_TIME_DIFF } from './constants';

export const toKoreaTime = (value: Date) => {
  return new Date(value.getTime() + KOREAN_TIME_DIFF)
    .toISOString()
    .replace('Z', '');
};
