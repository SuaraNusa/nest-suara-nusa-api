import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCredentials } from './dto/user-credentials.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from './authentication.validation';
import * as bcrypt from 'bcrypt';
import { LoggedUser } from './dto/logged-user.dto';
import { JwtService } from '@nestjs/jwt';
import CommonHelper from '../helper/CommonHelper';
import { OneTimePasswordToken, User } from '@prisma/client';
import { MailerService } from '../common/mailer.service';
import { ResponseAuthenticationDto } from './dto/authentication-token.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'winston';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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
          throw new HttpException(
            `User with email ${validatedUserCredentials.email} not found`,
            HttpStatus.UNAUTHORIZED,
          );
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

  async signAccessToken(
    loggedUser: LoggedUser,
  ): Promise<ResponseAuthenticationDto> {
    return {
      accessToken: await this.jwtService.signAsync(loggedUser),
      refreshToken: null,
    };
  }

  async generateOneTimePasswordVerification(
    currentUser: LoggedUser,
  ): Promise<string> {
    const generatedOneTimePassword = await this.prismaService.$transaction(
      async (prismaTransaction) => {
        const generatedOneTimePassword =
          await CommonHelper.generateOneTimePassword();
        const hashedGeneratedOneTimePassword = await bcrypt.hash(
          generatedOneTimePassword,
          10,
        );
        const userPrisma: User = await prismaTransaction.user
          .findFirstOrThrow({
            where: {
              uniqueId: currentUser['uniqueId'],
            },
          })
          .catch(() => {
            throw new UnauthorizedException(`User not found`);
          });
        await prismaTransaction.oneTimePasswordToken.create({
          data: {
            userId: userPrisma['id'],
            hashedToken: hashedGeneratedOneTimePassword,
            expiresAt: new Date(new Date().getTime() + 10 * 60 * 1000),
          },
        });
        return generatedOneTimePassword;
      },
    );
    await this.mailerService.dispatchMailTransfer({
      recipients: [
        {
          name: currentUser['name'],
          address: currentUser['email'],
        },
      ],
      subject: 'One Time Password Verification',
      text: `Bang! ini kode OTP nya: ${generatedOneTimePassword}`,
    });
    return `Successfully send one time password`;
  }

  async verifyOneTimePasswordToken(
    currentUser: LoggedUser,
    oneTimePassword: string,
  ): Promise<boolean> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirst({
          where: {
            uniqueId: currentUser['uniqueId'],
          },
        })
        .catch(() => {
          throw new UnauthorizedException(`User not found`);
        });
      const validOneTimePasswordToken: OneTimePasswordToken =
        await prismaTransaction.oneTimePasswordToken.findFirstOrThrow({
          where: {
            userId: userPrisma.id,
            expiresAt: {
              gte: new Date(),
            },
          },
        });
      if (
        validOneTimePasswordToken &&
        (await bcrypt.compare(
          oneTimePassword,
          validOneTimePasswordToken.hashedToken,
        ))
      ) {
        await prismaTransaction.user.update({
          where: {
            id: userPrisma.id,
          },
          data: {
            emailVerifiedAt: new Date(),
          },
        });
        return true;
      } else {
        return false;
      }
    });
  }

  async handleGoogleLogin(expressRequest: Express.Request) {
    const currentUser = expressRequest['user'];
    console.log(currentUser);
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user.findFirst({
        where: {
          email: currentUser['email'],
        },
      });
      const generatedUserUniqueId = uuidv4();
      if (userPrisma) {
        await prismaTransaction.user.create({
          data: {
            uniqueId: generatedUserUniqueId,
            email: currentUser['email'],
            name: `${currentUser['firstName']} ${currentUser['lastName']}`,
            photoPath: currentUser['photo'],
            isExternal: true,
          },
        });
      }
      const loggedUser: LoggedUser = {
        uniqueId: generatedUserUniqueId,
        name: `${currentUser['firstName']} ${currentUser['lastName']}`,
        gender: 'MAN',
        email: currentUser['email'],
        emailVerifiedAt: new Date(),
        telephone: null,
      };
      console.log(loggedUser);
      return {
        accessToken: this.jwtService.signAsync(loggedUser),
        refreshToken: currentUser['refreshToken'],
      };
    });
  }

  signUp(signUpDto: SignUpDto) {
    const validatedSignUpRequest = this.validationService.validate(
      AuthenticationValidation.SIGN_UP,
      signUpDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const isEmailExist = await prismaTransaction.user.count({
        where: {
          email: signUpDto.email,
        },
      });
      if (isEmailExist > 0) {
        throw new HttpException(
          'Email has been registered before!',
          HttpStatus.BAD_REQUEST,
        );
      }
      let hashedPassword = '';
      try {
        const hashSalt = await bcrypt.genSalt(10); // Generate hashSalt
        hashedPassword = await bcrypt.hash(signUpDto.password, hashSalt); // Hash the password
      } catch (error) {
        throw new HttpException(
          'Error when trying to process request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await prismaTransaction.user.create({
        data: {
          ...validatedSignUpRequest,
          password: hashedPassword,
          uniqueId: uuidv4(),
        },
      });
      return 'User successfully registered';
    });
  }
}
