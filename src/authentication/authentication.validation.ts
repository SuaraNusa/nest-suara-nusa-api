import { z, ZodType } from 'zod';

export class AuthenticationValidation {
  static readonly USER_CREDENTIALS: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string(),
  });
  static SIGN_UP: ZodType = z
    .object({
      name: z.string().min(5).max(100),
      email: z.string().email().min(1).max(255),
      password: z.string().min(1).max(100),
      confirmPassword: z.string().min(1).max(100),
      verificationQuestions: z.array(
        z.object({
          verificationQuestionId: z.number().min(1),
          answer: z.string().min(1).max(200),
        }),
      ),
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

  static RESET_PASSWORD: ZodType = z
    .object({
      newPassword: z.string().min(1).max(100),
      confirmationNewPassword: z.string().min(1).max(100),
    })
    .superRefine(({ newPassword, confirmationNewPassword }, ctx) => {
      if (newPassword !== confirmationNewPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'The passwords did not match',
          path: ['confirmPassword'],
        });
      }
    });
}
