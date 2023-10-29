import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { Cookie } from './common/cookie/cookie.decorator';
import { CookieTest } from './common/cookie/cookie-test.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHello(@Req() req: Request, @Res() res: Response) {
    res.cookie('diaryUser', 'cookie-test', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      signed: true,
    });
    return res.send();
  }
  @Get('cookie')
  getCookie(@Req() req: Request, @Cookie() cookie): string {
    return this.appService.getHello();
  }

  @Get('test')
  test(): void {
    return this.appService.test('1234');
  }
}
