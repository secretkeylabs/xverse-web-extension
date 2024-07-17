import { z } from 'zod';

const paramsSchema = z.object({
  transaction: z.string(),
  pubkey: z.string().optional(),
});

export default paramsSchema;
