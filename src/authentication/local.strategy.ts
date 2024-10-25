import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserCredentials } from './dto/user-credentials.dto';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(userCredentials: UserCredentials): Promise<any> {
    const user =
      await this.authenticationService.validateUserCredentials(userCredentials);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
