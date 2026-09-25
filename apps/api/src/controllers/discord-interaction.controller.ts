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

import {
  executeCommand,
  isCommandAllowedInChannel,
} from "../services/command.service";

import {
  executeMirrorAction,
  markDiscordResponseSuccess,
} from "../services/action.service";

import { sendInteractionFollowUp } from "../integrations/discord/discord.interactions";

async function processInteraction(
  interaction: DiscordInteraction,
  interactionId: string,
  serverId: string,
) {
  try {
    const channelCheck =
      await isCommandAllowedInChannel(
        serverId,
        interaction.channel_id!,
      );

    if (!channelCheck.allowed) {
      const message =
        channelCheck.reason === "NOT_CONFIGURED"
          ? "⚠️ This server has not been configured yet."
          : "⚠️ This command is not enabled in this channel.";

      await sendInteractionFollowUp(
        interaction.application_id,
        interaction.token,
        message,
      );

      await markDiscordResponseSuccess(
        interactionId,
      );

      await markInteractionCompleted(
        interactionId,
        message,
      );

      return;
    }

    const result = await executeCommand(interaction);

    await sendInteractionFollowUp(
      interaction.application_id,
      interaction.token,
      result.response,
    );

    await markDiscordResponseSuccess(
      interactionId,
    );

    /*
     * Mirror notification is a secondary action.
     * A mirror failure should not make the primary
     * Discord interaction fail.
     */
    try {
      await executeMirrorAction({
        interactionId,
        serverId,
        message: result.mirrorNotification,
      });
    } catch (error) {
      console.error(
        "Mirror notification failed:",
        error,
      );
    }

    await markInteractionCompleted(
      interactionId,
      result.response,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error.";

    await markInteractionFailed(
      interactionId,
      message,
    );

    console.error(
      "Discord interaction processing failed:",
      error,
    );
  }
}

export async function handleDiscordInteraction(
  req: Request,
  res: Response,
) {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        error: {
          code: "RAW_BODY_REQUIRED",
          message: "Raw request body is required.",
        },
      });
    }

    const interaction = JSON.parse(
      req.body.toString("utf-8"),
    ) as DiscordInteraction;

    if (
      interaction.type ===
      DiscordInteractionType.PING
    ) {
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
          message:
            "Unsupported Discord interaction type.",
        },
      });
    }

    if (!interaction.guild_id) {
      return res.status(400).json({
        error: {
          code: "GUILD_REQUIRED",
          message:
            "This command must be used inside a Discord server.",
        },
      });
    }

    if (!interaction.channel_id) {
      return res.status(400).json({
        error: {
          code: "CHANNEL_REQUIRED",
          message:
            "Discord channel information is missing.",
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
          message:
            "Discord user information is missing.",
        },
      });
    }

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
      /*
       * The interaction was already persisted.
       * Do not attempt to process it again.
       */
      return res.status(200).json({
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

    /*
     * Discord requires an interaction acknowledgement
     * within its response window.
     *
     * Type 5 = deferred channel message response.
     */
    res.json({
      type: 5,
    });

    /*
     * Everything after this point happens asynchronously.
     * The HTTP request has already been acknowledged.
     */
    void processInteraction(
      interaction,
      interactionRecord.interaction.id,
      server.id,
    );
  } catch (error) {
    console.error(
      "Discord interaction processing failed:",
      error,
    );

    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: "INTERACTION_PROCESSING_FAILED",
          message: "Failed to process Discord interaction.",
        },
      });
    }
  }
}