import { z } from 'zod';

const paramsSchema = z.object({
  transaction: z.string(),
  pubkey: z.string().optional(),
});

export type ParamsSchema = z.infer<typeof paramsSchema>;

export default paramsSchema;
