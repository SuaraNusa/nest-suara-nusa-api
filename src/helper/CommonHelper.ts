import * as crypto from 'crypto';
import { Storage } from '@google-cloud/storage';
import { v4 as uuid } from 'uuid';

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
  ) {
    await cloudStorage
      .bucket(bucketName)
      .file(`profile/${generatedFileName}`)
      .save(profileImage.buffer, {
        contentType: profileImage.mimetype,
      });
  }
}
