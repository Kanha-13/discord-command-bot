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
  executeAIAction,
  executeMirrorAction,
  markDiscordResponseSuccess,
} from "../services/action.service";

import { openReportModal, sendInteractionFollowUp, sendInteractionResponse, statusRefreshButton, updateInteractionResponse } from "../integrations/discord/discord.interactions";
import { getCommand } from "../commands/command.registry";
import { analyzeReport } from "../services/ai.services";

function getModalValue(
  interaction: DiscordInteraction,
  customId: string,
) {
  const rows = interaction.data?.components ?? [];

  for (const row of rows) {
    for (const component of row.components ?? []) {
      if (component.custom_id === customId) {
        return component.value;
      }
    }
  }

  return undefined;
}

async function processInteraction(
  interaction: DiscordInteraction,
  interactionId: string,
  serverId: string,
) {
  try {
    const channelCheck =
      await isCommandAllowedInChannel(
        serverId as string,
        interaction.data?.name as string,
        interaction.channel_id!,
      );

    if (!channelCheck.allowed) {
      let message =
        "⚠️ This command is not enabled in this channel.";

      if (channelCheck.reason === "NOT_CONFIGURED") {
        message =
          "⚠️ This server has not been configured yet.";
      }

      if (channelCheck.reason === "COMMAND_DISABLED") {
        message =
          "⚠️ This command is currently disabled.";
      }

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
      interaction.data?.name === "status"
        ? statusRefreshButton
        : undefined,
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

async function processModalSubmission(
  interaction: DiscordInteraction,
  interactionId: string,
  serverId: string,
) {
  try {
    const customId = interaction.data?.custom_id;

    if (customId !== "report_modal") {
      throw new Error(
        `Unsupported modal: ${customId ?? "unknown"}`,
      );
    }

    const report = getModalValue(
      interaction,
      "report_text",
    );

    if (
      typeof report !== "string" ||
      !report.trim()
    ) {
      throw new Error(
        "Report text is required.",
      );
    }

    const user =
      interaction.member?.user ??
      interaction.user;

    if (!user) {
      throw new Error(
        "Discord user information is missing.",
      );
    }

    const command = getCommand("report");

    if (!command) {
      throw new Error(
        "Report command is not registered.",
      );
    }

    const result = await command.execute({
      interactionId: interaction.id,
      guildId: interaction.guild_id!,
      channelId: interaction.channel_id!,
      userDiscordId: user.id,
      username:
        user.global_name ??
        user.username,
      options: {
        text: report,
      },
    });

    await sendInteractionFollowUp(
      interaction.application_id,
      interaction.token,
      result.response,
    );

    await markDiscordResponseSuccess(
      interactionId,
    );

    let analysis = null;

    try {
      analysis = await executeAIAction({
        interactionId,
        report,
      });
    } catch (error) {
      console.error(
        "AI analysis action failed:",
        error,
      );
    }

    try {
      let mirrorMessage = result.mirrorNotification;

      if (analysis) {
        mirrorMessage += `

        🤖 AI Analysis
        Category: ${analysis.category}
        Severity: ${analysis.severity}
        Summary: ${analysis.summary}`;
      } else {
        mirrorMessage += `
              
        🤖 AI Analysis
        Unavailable`;
      }
      await executeMirrorAction({
        interactionId,
        serverId,
        message: mirrorMessage,
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
      "Discord modal submission processing failed:",
      error,
    );
  }
}

async function processComponentInteraction(
  interaction: DiscordInteraction,
  interactionId: string,
) {
  try {
    const customId = interaction.data?.custom_id;

    if (!customId) {
      throw new Error(
        "Component custom_id is missing.",
      );
    }

    if (customId !== "status_refresh") {
      throw new Error(
        `Unsupported component: ${customId}`,
      );
    }

    const message = `🟢 Bot is operational.`;

    await updateInteractionResponse(
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
      "Discord component interaction processing failed:",
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
      interaction.type ===
      DiscordInteractionType.MODAL_SUBMIT
    ) {
      if (!interaction.guild_id) {
        return res.status(400).json({
          error: {
            code: "GUILD_REQUIRED",
            message:
              "This interaction must be used inside a Discord server.",
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
          commandName:
            `modal:${interaction.data?.custom_id ?? "unknown"}`,
          payload: interaction,
          createAIAction: true,
        });

      if (interactionRecord.duplicate) {
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
       * Type 5 here means:
       * acknowledge the modal submission
       * with a deferred channel message response.
       */
      res.json({
        type: 5,
      });

      void processModalSubmission(
        interaction,
        interactionRecord.interaction.id,
        server.id,
      );

      return;
    }

    if (
      interaction.type ===
      DiscordInteractionType.MESSAGE_COMPONENT
    ) {
      if (!interaction.guild_id) {
        return res.status(400).json({
          error: {
            code: "GUILD_REQUIRED",
            message:
              "This interaction must be used inside a Discord server.",
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
          commandName: `button:${interaction.data?.custom_id ?? "unknown"}`,
          payload: interaction,
          createMirrorAction: false,
        });

      if (interactionRecord.duplicate) {
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

      res.json({
        type: 6,
      });

      void processComponentInteraction(
        interaction,
        interactionRecord.interaction.id,
      );

      return;
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
        commandName: interaction.data.name || "",
        payload: interaction,
        createMirrorAction:
          interaction.data.name !== "report",
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

    const channelCheck =
      await isCommandAllowedInChannel(
        server.id,
        interaction.data.name!,
        interaction.channel_id!,
      );

    if (!channelCheck.allowed) {
      let message =
        "⚠️ This command is not enabled in this channel.";

      if (channelCheck.reason === "NOT_CONFIGURED") {
        message =
          "⚠️ This server has not been configured yet.";
      }

      if (channelCheck.reason === "COMMAND_DISABLED") {
        message =
          "⚠️ This command is currently disabled.";
      }

      await sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          content: message,
        },
      );

      await markDiscordResponseSuccess(
        interactionRecord.interaction.id,
      );

      await markInteractionCompleted(
        interactionRecord.interaction.id,
        message,
      );

      return;
    }

    /*
     * /report opens a Discord modal.
     * The modal must be the initial response to
     * the application command, so we cannot defer it.
     */
    if (interaction.data.name === "report") {
      try {
        await openReportModal(
          interaction.id,
          interaction.token,
        );

        await markDiscordResponseSuccess(
          interactionRecord.interaction.id,
        );

        await markInteractionCompleted(
          interactionRecord.interaction.id,
          "Report modal opened.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to open report modal.";

        await markInteractionFailed(
          interactionRecord.interaction.id,
          message,
        );

        console.error(
          "Failed to open report modal:",
          error,
        );
      }

      return;
    }

    /*
     * Normal slash commands use a deferred
     * channel message response.
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