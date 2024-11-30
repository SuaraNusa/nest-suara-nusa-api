import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggedUserDto } from '../authentication/dto/logged-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { CloudStorageService } from '../common/cloud-storage.service';
import { UserValidation } from './user.validation';
import CommonHelper from '../helper/CommonHelper';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

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
    let generatedFileName = `${uuidv4()}-${profileImage.originalname}`;
    const cloudStorageInstance =
      await this.cloudStorageService.loadCloudStorageInstance();
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const { id: userId, photoPath } = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
          select: {
            id: true,
            photoPath: true,
          },
        })
        .catch(() => {
          throw new HttpException('User does not exist', 400);
        });
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      await CommonHelper.handleUploadImage(
        cloudStorageInstance,
        bucketName,
        profileImage,
        generatedFileName,
        'image-resources',
      );
      if (photoPath) {
        await cloudStorageInstance
          .bucket(bucketName)
          .file(`image-resources/${photoPath}`)
          .delete();
      }
      // if (photoPath) {
      //   fs.unlinkSync(
      //     `${this.configService.get<string>('MULTER_DEST')}/image-resources/${photoPath}`,
      //   );
      // }
      // generatedFileName = await CommonHelper.handleSaveFileLocally(
      //   this.configService,
      //   profileImage,
      //   'image-resources',
      // );
      delete validatedUpdatedUserDto['confirmPassword'];
      let hashedPassword = '';
      try {
        const hashSalt = await bcrypt.genSalt(10); // Generate hashSalt
        hashedPassword = await bcrypt.hash(
          validatedUpdatedUserDto.password,
          hashSalt,
        ); // Hash the password
      } catch (error) {
        throw new HttpException(
          'Error when trying to process request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await prismaTransaction.user.update({
        where: {
          id: userId,
        },
        data: {
          ...validatedUpdatedUserDto,
          photoPath: generatedFileName,
          password: hashedPassword,
        },
      });
      return 'Successfully updated user';
    });
  }
}
