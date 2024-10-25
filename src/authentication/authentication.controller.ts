import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  Request,
  HttpException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoggedUser } from './dto/logged-user.dto';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from './decorator/current-user.decorator';
import { ResponseAuthenticationDto } from './dto/authentication-token.dto';
import { GoogleOAuthGuard } from './guard/google-auth.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(
    @CurrentUser() loggedUser: LoggedUser,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.authenticationService.signAccessToken(loggedUser),
      },
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() a: Express.Request) {
    return a.logout((err) => {
      if (err) {
        throw new HttpException('Failed to logout', err.status);
      }
    });
  }

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() expressRequest: Express.Request) {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() expressRequest: Express.Request) {
    return this.authenticationService.handleGoogleLogin(expressRequest);
  }
}
