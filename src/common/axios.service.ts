import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';

export class AxiosService implements HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
    return {
      timeout: 20000,
      maxRedirects: 5,
    };
  }
}
