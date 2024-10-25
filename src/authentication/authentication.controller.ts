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
import { CurrentUser } from './decorator/current-user.dto';
import { LoggedUser } from './dto/logged-user.dto';
import { WebResponse } from '../model/web.response';
import { ResponseAuthenticationDto } from '../dto/response.authentication';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authenticationService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(+id);
  }
}
