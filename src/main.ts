import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const logger = new Logger();

  logger.log(`PORT: ${port}`);
  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(new ValidationPipe());

  // TODO
  // app.enableShutdownHooks();
  await app.listen(port);
}
bootstrap();
