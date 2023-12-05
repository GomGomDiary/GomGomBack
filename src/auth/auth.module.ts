import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DiaryModule } from 'src/diary/diary.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from 'src/config';
import { AnswerGuard } from './guards/cookie.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: `./.env.${process.env.NODE_ENV}`,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
    forwardRef(() => DiaryModule),
  ],
  providers: [AuthService, AuthGuard, AnswerGuard],
  exports: [AuthService, AuthGuard, AnswerGuard],
})
export class AuthModule {}
