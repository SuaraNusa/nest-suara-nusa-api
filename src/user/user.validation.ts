import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly UPDATE_USER: ZodType = z
    .object({
      name: z.string().min(5).max(100),
      email: z.string().email().min(1).max(255),
      password: z.string().min(1).max(100),
      confirmPassword: z.string().min(1).max(100),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'The passwords did not match',
          path: ['confirmPassword'],
        });
      }
    });
}
