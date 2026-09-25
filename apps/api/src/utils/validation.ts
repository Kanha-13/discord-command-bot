import { z } from "zod";

export const serverConfigurationSchema =
  z.object({
    commandChannelId: z
      .string()
      .min(1),

    mirrorChannelId: z
      .string()
      .min(1),
  });

export const interactionQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  serverId: z.string().min(1).optional(),

  command: z.string().min(1).optional(),

  status: z
    .enum([
      "RECEIVED",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
    ])
    .optional(),
});