import {
  getCommand,
} from "../commands/command.registry";

import {
  optionsToRecord,
} from "../commands/command.utils";

import type {
  DiscordInteraction,
} from "../integrations/discord/discord.types";

import { getInteractionConfiguration } from "../services/interaction.service";

import {
  getCommandConfiguration,
} from "./command-configuration.service";


export async function executeCommand(
  interaction: DiscordInteraction,
) {
  if (!interaction.data) {
    throw new Error("Discord command data is missing.");
  }

  if (!interaction.guild_id) {
    throw new Error("Command must be executed inside a server.");
  }

  if (!interaction.channel_id) {
    throw new Error("Command channel is missing.");
  }

  if (!interaction.data.name) {
    throw new Error("Command name missing.");
  }

  const command = getCommand(interaction.data.name);

  if (!command) {
    throw new Error(
      `Unknown command: ${interaction.data.name}`,
    );
  }

  const user =
    interaction.member?.user ??
    interaction.user;

  if (!user) {
    throw new Error("Discord user information is missing.");
  }

  return command.execute({
    interactionId: interaction.id,
    guildId: interaction.guild_id,
    channelId: interaction.channel_id,
    userDiscordId: user.id,
    username: user.global_name ?? user.username,
    options: optionsToRecord(
      interaction.data.options,
    ),
  });
}

export async function isCommandAllowedInChannel(
  serverId: string,
  commandName: string,
  channelId: string,
) {
  const commandConfiguration =
    await getCommandConfiguration(
      serverId,
      commandName,
    );

  if (commandConfiguration) {
    if (!commandConfiguration.enabled) {
      return {
        allowed: false,
        reason: "COMMAND_DISABLED" as const,
      };
    }

    if (
      commandConfiguration.channelId !== channelId
    ) {
      return {
        allowed: false,
        reason: "INVALID_CHANNEL" as const,
      };
    }

    return {
      allowed: true,
      reason: null,
    };
  }

  // Backward-compatible fallback for servers
  // that have not created command-specific rules.
  const serverConfiguration =
    await getInteractionConfiguration(serverId);

  if (!serverConfiguration) {
    return {
      allowed: false,
      reason: "NOT_CONFIGURED" as const,
    };
  }

  if (
    serverConfiguration.commandChannelId !== channelId
  ) {
    return {
      allowed: false,
      reason: "INVALID_CHANNEL" as const,
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}