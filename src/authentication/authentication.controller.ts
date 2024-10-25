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

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  signUp() {
    return 'Successfully logged in';
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
