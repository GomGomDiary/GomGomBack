const NODE_ENV = process.env.NODE_ENV ?? 'development';

export default () => ({
  PORT: NODE_ENV === 'production' ? 80 : process.env.PORT ?? 8765,
  MONGO_URI: process.env.MONGO_URI as string,
  COOKIE_SECRET: process.env.COOKIE_SECRET ?? '1234',
  COOKIE_OPTION: {
    httpOnly: true,
    signed: NODE_ENV === 'production' ? true : false,
    expires: new Date(253402300000000),
  },
});
