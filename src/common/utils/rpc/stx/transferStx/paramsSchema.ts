import { z } from 'zod';

const paramsSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  recipient: z.string(),
  memo: z.string().optional(),
});

export default paramsSchema;
