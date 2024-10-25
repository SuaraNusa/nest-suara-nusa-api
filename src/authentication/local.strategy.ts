import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserCredentials } from './dto/user-credentials.dto';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { LoggedUser } from './dto/logged-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(userCredentials: UserCredentials): Promise<LoggedUser> {
    const loggedUser: LoggedUser =
      await this.authenticationService.validateUserCredentials(userCredentials);
    if (!loggedUser) {
      throw new UnauthorizedException();
    }
    return loggedUser;
  }
}
