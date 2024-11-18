import { z, ZodType } from 'zod';
import { ConvertHelper } from '../helper/ConvertHelper';
import { InstrumentCategory } from '@prisma/client';

export class InstrumentValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1),
    originRegional: z.string().min(1),
    instrumentCategory: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Assistance format not valid',
        InstrumentCategory,
      );
    }),
    description: z.string(),
    videoUrls: z.array(z.string()),
  });

  static readonly UPDATE: ZodType = z.intersection(
    InstrumentValidation.SAVE,
    z.object({
      deletedFiles: z.array(z.coerce.number()).optional(), // Optional jika properti ini tidak selalu ada
    }),
  );
}
