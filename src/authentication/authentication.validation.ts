import { z, ZodType } from 'zod';

export class AuthenticationValidation {
  static readonly USER_CREDENTIALS: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string(),
  });
  static SIGN_UP: ZodType = z.object({
    name: z.string().min(5).max(100),
    telephone: z.string().min(1).max(13),
    password: z.string().min(1).max(100),
    verification_questions: z.array(
      z.object({
        question_id: z.number().min(1),
        answer: z.string().min(1).max(200),
      }),
    ),
  });
}
