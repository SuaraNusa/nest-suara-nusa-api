import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoggedUserDto } from './dto/logged-user.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { GoogleOAuthGuard } from './guard/google-auth.guard';
import { Public } from './decorator/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { NoVerifiedEmail } from './decorator/no-verified-email.decorator';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPassword } from './dto/reset-password.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @NoVerifiedEmail()
  @Post('login')
  async signIn(@CurrentUser() loggedUser: LoggedUserDto) {
    return this.authenticationService.signAccessToken(loggedUser);
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
  async signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.authenticationService.signUp(signUpDto);
  }

  @Public()
  @Post('generate-otp')
  async generateOneTimePasswordVerification(
    @Body() emailUser: { email: string },
  ): Promise<string> {
    return this.authenticationService.generateOneTimePasswordVerification(
      emailUser,
    );
  }

  @Public()
  @Post('verify-otp')
  async verifyOneTimePasswordVerification(
    @Body() verifyToken: VerifyTokenDto,
  ): Promise<boolean> {
    return this.authenticationService.verifyOneTimePasswordToken(verifyToken);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPassword: ResetPassword) {
    return this.authenticationService.handleResetPassword(resetPassword);
  }

  @Public()
  @NoVerifiedEmail()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() expressRequest: Express.Request) {}

  @Public()
  @NoVerifiedEmail()
  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() expressRequest: Express.Request) {
    return this.authenticationService.handleGoogleLogin(expressRequest);
  }
}
