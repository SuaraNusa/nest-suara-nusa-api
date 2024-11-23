import * as crypto from 'crypto';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as fsPromises from 'fs/promises';
import * as fs from 'node:fs';
import { HttpException } from '@nestjs/common';

export default class CommonHelper {
  static async generateOneTimePassword(
    lengthOfPassword: number = 6,
  ): Promise<string> {
    const max = Math.pow(10, lengthOfPassword);
    const randomNumber = crypto.randomInt(0, max);
    return randomNumber.toString().padStart(lengthOfPassword, '0');
  }

  static async handleUploadImage(
    cloudStorage: Storage,
    bucketName: string,
    profileImage: Express.Multer.File,
    generatedFileName: string,
    folderName: string,
  ) {
    await cloudStorage
      .bucket(bucketName)
      .file(`${folderName}/${generatedFileName}`)
      .save(profileImage.buffer, {
        contentType: profileImage.mimetype,
      });
  }

  static async handleSaveFileLocally(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
    const folderPath = `${configService.get<string>('MULTER_DEST')}/${folderName}/`;
    await fsPromises.mkdir(folderPath, { recursive: true });
    fs.writeFile(
      folderPath + generatedSingleFileName,
      singleFile.buffer,
      (err) => {
        if (err) {
          throw new HttpException(err, 500);
        }
      },
    );
    return generatedSingleFileName;
  }
}
