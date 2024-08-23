/* eslint-disable import/prefer-default-export */
/* eslint-disable import/prefer-default-export */
import type { CallContractParams } from '@sats-connect/core';
import { z } from 'zod';

export const callContractParamsSchema = z.object({
  contract: z.string(),
  functionName: z.string(),
  arguments: z.array(z.string()).optional(),
}) satisfies z.ZodSchema<CallContractParams>;
