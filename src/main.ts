import { otelSDK } from './utils/tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setUp } from './utils/setUp';

async function bootstrap() {
  otelSDK.start();
  const app = await NestFactory.create(AppModule, {});

  setUp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 80;
  const logger = new Logger();

  logger.log(`🚀 PORT: ${port}`);
  await app.listen(port);
}
bootstrap();
