import {
  getCommand,
} from "../commands/command.registry";

import {
  optionsToRecord,
} from "../commands/command.utils";

import type {
  DiscordInteraction,
} from "../integrations/discord/discord.types";

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