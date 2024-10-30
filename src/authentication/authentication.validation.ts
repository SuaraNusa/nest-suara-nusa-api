import { z, ZodType } from 'zod';
import { UserGender } from '@prisma/client';
import { ConvertHelper } from '../helper/ConvertHelper';

export class AuthenticationValidation {
  static readonly USER_CREDENTIALS: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string(),
  });
  static SIGN_UP: ZodType = z.object({
    name: z.string().min(5).max(100),
    gender: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'User gender not valid',
        UserGender,
      );
    }),
    email: z.string().email().min(1).max(255),
    telephone: z.string().min(1).max(13),
    password: z.string().min(1).max(100),
  });
}
