import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const logger = new Logger();

  const env = configService.get<string>('NODE_ENV');
  const swaggerName = configService.get<string>('SWAGGER_USER');
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');
  const domainUrl = configService.get<string>('DOMAIN_URL');

  if (env === 'development') mongoose.set('debug', true);
  if (env === 'production') app.enableShutdownHooks();

  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors({
    origin: [domainUrl],
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(
    ['/docs'],
    basicAuth({
      challenge: true,
      users: { [swaggerName]: swaggerPassword },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const config = new DocumentBuilder()
    .setTitle('Diary')
    .setDescription('Diary API description')
    .setVersion('1.0')
    .addTag('Diary')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token 입력',
        in: 'header',
      },
      'Token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  logger.log(`PORT: ${port}`);
  await app.listen(port);
}
bootstrap();
