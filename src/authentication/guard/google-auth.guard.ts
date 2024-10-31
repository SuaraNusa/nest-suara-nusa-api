import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private reflector: Reflector) {
    super({
      accessType: 'offline',
    });
  }
}
