import type { Request, Response } from "express";
import {
  DiscordInteractionType,
  type DiscordInteraction,
} from "../integrations/discord/discord.types";

export async function handleDiscordInteraction(
  req: Request,
  res: Response,
) {
  const interaction = JSON.parse(
    (req.body as Buffer).toString("utf-8"),
  ) as DiscordInteraction;

  if (interaction.type === DiscordInteractionType.PING) {
    return res.json({
      type: 1,
    });
  }

  if (interaction.type === DiscordInteractionType.APPLICATION_COMMAND) {
    return res.json({
      type: 4,
      data: {
        content: "Command received.",
      },
    });
  }

  return res.status(400).json({
    error: {
      code: "UNSUPPORTED_INTERACTION",
      message: "Unsupported Discord interaction type.",
    },
  });
}