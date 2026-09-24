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