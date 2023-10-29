import { Injectable } from '@nestjs/common';
import { CookieTest } from './common/cookie/cookie-test.decorator';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @CookieTest()
  test(name: string): void {
    console.log('=== service ===');
  }
}
