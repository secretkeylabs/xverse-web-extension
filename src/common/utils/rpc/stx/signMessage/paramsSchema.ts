import { z } from 'zod';

export const rpcParamsSchema = z.object({
  message: z.string(),
});

export type Params = z.infer<typeof rpcParamsSchema>;
