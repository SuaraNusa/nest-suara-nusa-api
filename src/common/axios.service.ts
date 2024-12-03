import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';

export class AxiosService implements HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
    return {
      timeout: 0,
      maxRedirects: 5,
    };
  }
}
