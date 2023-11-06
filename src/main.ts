import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const logger = new Logger();

  logger.log(`PORT: ${port}`);
  const env = configService.get<string>('NODE_ENV');

  if (env === 'development') {
    mongoose.set('debug', true);
  }

  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // TODO
  // app.enableShutdownHooks();
  await app.listen(port);
}
bootstrap();
