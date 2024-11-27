import { HttpException, Injectable } from '@nestjs/common';
import { LoggedUserDto } from '../authentication/dto/logged-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { CloudStorageService } from '../common/cloud-storage.service';
import { UserValidation } from './user.validation';
import CommonHelper from '../helper/CommonHelper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async update(
    loggedUser: LoggedUserDto,
    updateUserDto: UpdateUserDto,
    profileImage: Express.Multer.File,
  ) {
    const validatedUpdatedUserDto = this.validationService.validate(
      UserValidation.UPDATE_USER,
      updateUserDto,
    );
    const generatedFileName = `${uuidv4()}-${profileImage.originalname}`;
    const cloudStorageInstance =
      await this.cloudStorageService.loadCloudStorageInstance();
    await this.prismaService.$transaction(async (prismaTransaction) => {
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
          throw new HttpException('User does not exist', 400);
        });
      await CommonHelper.handleUploadImage(
        cloudStorageInstance,
        this.configService.get<string>('BUCKET_NAME'),
        profileImage,
        generatedFileName,
        'image-resources',
      );
      delete validatedUpdatedUserDto['confirmPassword'];
      await prismaTransaction.user.update({
        where: {
          id: userId,
        },
        data: {
          ...validatedUpdatedUserDto,
          photoPath: generatedFileName,
        },
      });
      return 'Successfully updated user';
    });
  }
}
