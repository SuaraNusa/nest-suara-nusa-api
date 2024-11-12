import { z, ZodType } from 'zod';

export class QuestionValidation {
  static readonly SAVE: ZodType = z.object({
    question: z.string().min(5),
  });
}
