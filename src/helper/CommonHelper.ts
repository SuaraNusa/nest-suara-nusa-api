import * as crypto from 'crypto';

export default class CommonHelper {
  static async generateOneTimePassword(
    lengthOfPassword: number = 6,
  ): Promise<string> {
    const max = Math.pow(10, lengthOfPassword);
    const randomNumber = crypto.randomInt(0, max);
    return randomNumber.toString().padStart(lengthOfPassword, '0');
  }
}
