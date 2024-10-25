import { z, ZodType } from 'zod';

export class AuthenticationValidation {
  static readonly USER_CREDENTIALS: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string(),
  });
}
