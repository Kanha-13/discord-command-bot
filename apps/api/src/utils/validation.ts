import { z } from "zod";

export const commandConfigurationSchema = z.object({
  commandName: z.string().min(1),
  enabled: z.boolean(),
  channelId: z.string().min(1),
});

export const serverConfigurationSchema =
  z.object({
    commandChannelId: z.string().min(1),
    mirrorChannelId: z.string().min(1),
    commands: z
      .array(commandConfigurationSchema)
      .default([]),
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
