export const ANSWER = 'answer';
export const ANSWERERS = 'answerers';
export const QUESTION = 'question';
export const CACHE_TTL = process.env.CACHE_TTL ? +process.env.CACHE_TTL : 1;
export const DEFAULT_PAGINATE = [5, 10, 15, 20];
export const SORT_ORDER = ['asc', 'desc'];
export const KOREAN_TIME_DIFF = 9 * 60 * 60 * 1000;
