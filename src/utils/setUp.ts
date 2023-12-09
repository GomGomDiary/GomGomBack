import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import basicAuth from 'express-basic-auth';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setUp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const env = configService.get<string>('NODE_ENV');
  const swaggerName = configService.get<string>('SWAGGER_USER');
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');
  const domainUrl = configService.get<string>('DOMAIN_URL');

  if (env === 'development') mongoose.set('debug', true);
  if (env === 'production') app.enableShutdownHooks();

  app.use(cookieParser(cookieSecret));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

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
}
