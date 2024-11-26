import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCredentialDto } from './dto/user-credential.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { AuthenticationValidation } from './authentication.validation';
import * as bcrypt from 'bcrypt';
import { LoggedUserDto } from './dto/logged-user.dto';
import { JwtService } from '@nestjs/jwt';
import CommonHelper from '../helper/CommonHelper';
import { OneTimePasswordToken, User } from '@prisma/client';
import { MailerCustomService } from '../common/mailer.service';
import { AuthenticationTokenDto } from './dto/authentication-token.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
    private readonly mailerCustomService: MailerCustomService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUserCredentials(
    userCredentials: UserCredentialDto,
  ): Promise<LoggedUserDto> {
    const validatedUserCredentials = this.validationService.validate(
      AuthenticationValidation.USER_CREDENTIALS,
      userCredentials,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
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
    loggedUser: LoggedUserDto,
  ): Promise<AuthenticationTokenDto> {
    return {
      accessToken: await this.jwtService.signAsync(loggedUser),
      refreshToken: null,
    };
  }

  async generateOneTimePasswordVerification(
    currentUser: LoggedUserDto,
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
    // await this.mailerCustomService.dispatchMailTransfer({
    //   recipients: [
    //     {
    //       name: currentUser['name'],
    //       address: currentUser['email'],
    //     },
    //   ],
    //   subject: 'One Time Password Verification',
    //   text: `Bang! ini kode OTP nya: ${generatedOneTimePassword}`,
    // });
    await this.mailerService.sendMail({
      from: this.configService.get<string>('EMAIL_USERNAME'),
      to: currentUser['email'],
      subject: 'One Time Password Verification',
      text: `Bang! ini kode OTP nya: ${generatedOneTimePassword}`,
    });
    return `Successfully send one time password`;
  }

  async verifyOneTimePasswordToken(
    currentUser: LoggedUserDto,
    oneTimePassword: string,
  ): Promise<string> {
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
        return 'One time password verified';
      } else {
        return 'One time password not valid';
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
      const loggedUser: LoggedUserDto = {
        uniqueId: generatedUserUniqueId,
        name: `${currentUser['firstName']} ${currentUser['lastName']}`,
        email: currentUser['email'],
        emailVerifiedAt: new Date(),
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
      delete validatedSignUpRequest['confirmPassword'];
      const {
        verificationQuestions: verificationQuestion,
        ...remainderProperty
      } = validatedSignUpRequest;
      await prismaTransaction.user.create({
        data: {
          ...remainderProperty,
          password: hashedPassword,
          uniqueId: uuidv4(),
          UserVerificationQuestion: {
            create: verificationQuestion,
          },
        },
        include: {
          UserVerificationQuestion: true,
        },
      });
      return 'User successfully registered';
    });
  }

  async handleResetPassword(
    loggedUser: LoggedUserDto,
    resetPassword: ResetPasswordDto,
  ) {
    const validatedResetPassword = this.validationService.validate(
      AuthenticationValidation.RESET_PASSWORD,
      resetPassword,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const { id: userId } = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
          select: {
            id: true,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      await prismaTransaction.user.update({
        where: {
          id: userId,
        },
        data: {
          password: validatedResetPassword.newPassword,
        },
      });
      return 'User has successfully change password';
    });
  }
}
