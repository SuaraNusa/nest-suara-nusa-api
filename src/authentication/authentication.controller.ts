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
import { LoggedUserDto } from './dto/logged-user.dto';
import { WebResponseDto } from '../model/web.response.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { AuthenticationTokenDto } from './dto/authentication-token.dto';
import { GoogleOAuthGuard } from './guard/google-auth.guard';
import { Public } from './decorator/public.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { NoVerifiedEmail } from './decorator/no-verified-email.decorator';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import {
  ApiErrorResponseStringCustom,
  ApiOkResponseCustom,
} from '../helper/ResponseHelper';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @NoVerifiedEmail()
  @Post('login')
  @ApiOkResponseCustom(AuthenticationTokenDto)
  @ApiErrorResponseStringCustom(
    'Returns "Credentials not valid" if authentication fails',
    400,
  ) // Dokumentasi respons kesalahan
  async signIn(
    @CurrentUser() loggedUser: LoggedUserDto,
  ): Promise<WebResponseDto<AuthenticationTokenDto>> {
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
  async signUp(@Body() signUpDto: SignUpDto): Promise<WebResponseDto<string>> {
    return {
      result: {
        data: await this.authenticationService.signUp(signUpDto),
      },
    };
  }

  @NoVerifiedEmail()
  @Get('generate-otp')
  @ApiCreatedResponse({
    description: 'The OTP has been successfully sent',
    type: 'Successfully send one time password',
  })
  async generateOneTimePasswordVerification(
    @CurrentUser() currentUser: LoggedUserDto,
  ): Promise<WebResponseDto<string>> {
    return {
      result: {
        data: await this.authenticationService.generateOneTimePasswordVerification(
          currentUser,
        ),
      },
    };
  }

  @NoVerifiedEmail()
  @Post('verify-otp')
  async verifyOneTimePasswordVerification(
    @CurrentUser() loggedUser: LoggedUserDto,
    verifyToken: VerifyTokenDto,
  ): Promise<WebResponseDto<string>> {
    return {
      result: {
        data: await this.authenticationService.verifyOneTimePasswordToken(
          loggedUser,
          verifyToken.token,
        ),
      },
    };
  }

  @Post('reset-password')
  async resetPassword(
    @CurrentUser() loggedUser: LoggedUserDto,
    resetPassword: ResetPasswordDto,
  ) {
    return {
      result: {
        data: await this.authenticationService.handleResetPassword(
          loggedUser,
          resetPassword,
        ),
      },
    };
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
