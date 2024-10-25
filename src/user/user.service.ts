import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from '../authentication/authentication.validation';
import * as bcrypt from 'bcrypt';
import { UserCredentials } from '../authentication/dto/user-credentials.dto';
import { LoggedUser } from '../authentication/dto/logged-user.dto';

@Injectable()
export class UserService {


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
