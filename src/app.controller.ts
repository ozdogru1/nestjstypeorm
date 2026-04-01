import { Controller, Get, Headers } from '@nestjs/common';
import { HttpClientService } from './http/http-client.service';

@Controller()
export class AppController {
  @Get()
  root() {
    return 'OK';
  }

  constructor(private readonly httpClient: HttpClientService) {}

  // Basit health/test endpoint'i: ecommerce servisindeki getLoggedinProfile'ı çağırır.
  @Get('test/getLoggedinProfile')
  async getLoggedinProfile(
    @Headers('authorization') authorization?: string,
  ) {
    return this.httpClient.getEcommerce('getLoggedinProfile', { authorization: authorization });
  }
}