import { Injectable } from '@nestjs/common';
import { UserCredentials } from './dto/user-credentials.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from './authentication.validation';
import * as bcrypt from 'bcrypt';
import { LoggedUser } from './dto/logged-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from '../dto/response.authentication';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserCredentials(
    userCredentials: UserCredentials,
  ): Promise<LoggedUser> {
    const validatedUserCredentials = this.validationService.validate(
      AuthenticationValidation.USER_CREDENTIALS,
      userCredentials,
    );
    return await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            email: validatedUserCredentials.email,
          },
        })
        .catch(() => {
          return null;
        });
      bcrypt.compare(
        validatedUserCredentials.password,
        userPrisma.password,
        function (_err, isMatch) {
          if (!isMatch) {
            return null;
          }
        },
      );
      return {
        ...userPrisma,
      };
    });
  }

  findAll() {
    return `This action returns all authentication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }

  async signAccessToken(
    loggedUser: LoggedUser,
  ): Promise<ResponseAuthenticationDto> {
    return {
      accessToken: await this.jwtService.signAsync(loggedUser),
    };
  }
}
