const NODE_ENV = process.env.NODE_ENV ?? 'development';

export interface Config {
  PORT: number;
  MONGO_URI: string;
  COOKIE_SECRET: string;
}

export default () => ({
  PORT: NODE_ENV === 'production' ? 80 : process.env.PORT ?? 8765,
  MONGO_URI: process.env.MONGO_URI as string,
  COOKIE_SECRET: process.env.COOKIE_SECRET ?? '1234',
});
