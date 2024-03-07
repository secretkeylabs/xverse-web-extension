/* eslint-disable import/prefer-default-export */
import { CallContractParams } from 'sats-connect';
import { z } from 'zod';

export const callContractParamsSchema = z.object({
  contract: z.string(),
  functionName: z.string(),
  arguments: z.array(z.string()).optional(),
}) satisfies z.ZodSchema<CallContractParams>;
