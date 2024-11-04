import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { LoggedUserDto } from '../authentication/dto/logged-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put('')
  @UseInterceptors(FileInterceptor('profile'))
  async update(
    @CurrentUser() loggedUser: LoggedUserDto,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileFile: Express.Multer.File,
  ) {
    await this.userService.update(loggedUser, updateUserDto, profileFile);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
