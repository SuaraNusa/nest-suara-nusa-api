import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import { UserCredentialDto } from '../dto/user-credential.dto';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { LoggedUserDto } from '../dto/logged-user.dto';
import { Logger, loggers } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  constructor(private authenticationService: AuthenticationService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(userEmail: string, userPassword: string): Promise<LoggedUserDto> {
    const userCredentials: UserCredentialDto = new UserCredentialDto(
      userEmail,
      userPassword,
    );
    const loggedUser: LoggedUserDto =
      await this.authenticationService.validateUserCredentials(userCredentials);
    if (!loggedUser) {
      throw new UnauthorizedException();
    }
    return loggedUser;
  }
}
