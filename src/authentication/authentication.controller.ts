import {
  Controller,
  Get,
  UseGuards,
  Post,
  Request,
  HttpException,
  Body,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoggedUser } from './dto/logged-user.dto';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from './decorator/current-user.decorator';
import { ResponseAuthenticationDto } from './dto/authentication-token.dto';
import { GoogleOAuthGuard } from './guard/google-auth.guard';
import { Public } from './decorator/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
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
  @Post('logout')
  async logout(@Request() expressRequest: Express.Request) {
    return expressRequest.logout((err) => {
      if (err) {
        throw new HttpException('Failed to logout', err.status);
      }
    });
  }

  @Public()
  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.authenticationService.signUp(signUpDto),
      },
    };
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
