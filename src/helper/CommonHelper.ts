import * as crypto from 'crypto';
import { Storage } from '@google-cloud/storage';

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
    fileName: string,
  ) {
    await cloudStorage.bucket(bucketName).upload(`profile/${fileName}`, {
      destination: fileName,
    });
  }
}
