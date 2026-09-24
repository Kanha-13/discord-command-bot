import type { Request, Response } from "express";
import { getOrCreateServer } from "../services/server.service";

import {
  DiscordInteractionType,
  type DiscordInteraction,
} from "../integrations/discord/discord.types";

import {
  getOrCreateInteraction,
  markInteractionCompleted,
  markInteractionFailed,
  markInteractionProcessing,
} from "../services/interaction.service";

import { executeCommand } from "../services/command.service";
import { executeMirrorAction, markDiscordResponseSuccess } from "../services/action.service";

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

  if (
    interaction.type !==
    DiscordInteractionType.APPLICATION_COMMAND
  ) {
    return res.status(400).json({
      error: {
        code: "UNSUPPORTED_INTERACTION",
        message: "Unsupported Discord interaction type.",
      },
    });
  }

  if (!interaction.guild_id) {
    return res.status(400).json({
      error: {
        code: "GUILD_REQUIRED",
        message: "This command must be used inside a Discord server.",
      },
    });
  }

  if (!interaction.channel_id) {
    return res.status(400).json({
      error: {
        code: "CHANNEL_REQUIRED",
        message: "Discord channel information is missing.",
      },
    });
  }

  if (!interaction.data) {
    return res.status(400).json({
      error: {
        code: "COMMAND_DATA_REQUIRED",
        message: "Command data is missing.",
      },
    });
  }

  const user =
    interaction.member?.user ??
    interaction.user;

  if (!user) {
    return res.status(400).json({
      error: {
        code: "USER_REQUIRED",
        message: "Discord user information is missing.",
      },
    });
  }

  try {
    const server = await getOrCreateServer({
      guildId: interaction.guild_id,
    });

    const interactionRecord =
      await getOrCreateInteraction({
        interactionId: interaction.id,
        serverId: server.id,
        channelId: interaction.channel_id,
        userDiscordId: user.id,
        commandName: interaction.data.name,
        payload: interaction,
      });

    if (interactionRecord.duplicate) {
      return res.json({
        type: 4,
        data: {
          content:
            "This interaction has already been processed.",
        },
      });
    }

    await markInteractionProcessing(
      interactionRecord.interaction.id,
    );

    try {
      const result = await executeCommand(interaction);

      res.json({
        type: 4,
        data: {
          content: result.response,
        },
      });

      await markDiscordResponseSuccess(
        interactionRecord.interaction.id,
      );

      const mirrorSucceeded =
        await executeMirrorAction({
          interactionId: interactionRecord.interaction.id,
          serverId: server.id,
          message: result.mirrorNotification,
        });

      if (mirrorSucceeded) {
        await markInteractionCompleted(
          interactionRecord.interaction.id,
          result.response,
        );
      } else {
        await markInteractionFailed(
          interactionRecord.interaction.id,
          "Mirror notification failed after retries.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error.";

      await markInteractionFailed(
        interactionRecord.interaction.id,
        message,
      );

      if (!res.headersSent) {
        return res.status(500).json({
          error: {
            code: "INTERACTION_PROCESSING_FAILED",
            message,
          },
        });
      }
    }

  } catch (error) {
    console.error("Discord interaction processing failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    return res.status(500).json({
      error: {
        code: "INTERACTION_PROCESSING_FAILED",
        message,
      },
    });
  }
}