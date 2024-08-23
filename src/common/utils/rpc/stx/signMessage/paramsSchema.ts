/* eslint-disable import/prefer-default-export */
import { z } from 'zod';

export const rpcParamsSchema = z.object({
  message: z.string(),
});
