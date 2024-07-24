/* eslint-disable import/prefer-default-export */
/* eslint-disable import/prefer-default-export */
import type { DeployContractParams } from '@sats-connect/core';
import { z } from 'zod';

export const deployContractParamsSchema = z.object({
  name: z.string(),
  clarityCode: z.string(),
  clarityVersion: z.string().optional(),
}) satisfies z.ZodSchema<DeployContractParams>;
