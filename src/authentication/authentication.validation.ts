import { z, ZodType } from 'zod';

export class AuthenticationValidation {
  static readonly USER_CREDENTIALS: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string(),
  });
  static SIGN_UP: ZodType = z.object({
    name: z.string().min(5).max(100),
    email: z.string().email().min(1).max(255),
    password: z.string().min(1).max(100),
    verification_questions: z.array(
      z.object({
        verificationQuestionId: z.number().min(1),
        answer: z.string().min(1).max(200),
      }),
    ),
  });
}
