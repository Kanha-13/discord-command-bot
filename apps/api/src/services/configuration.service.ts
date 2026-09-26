import { findById } from "../repositories/server.repository";

import {
  findByServerId,
} from "../repositories/configuration.repository";

import {
  findCommandConfigurationsByServerId,
} from "../repositories/command-configuration.repository";

import {
  getRegisteredCommands,
} from "../commands/command.registry";

import { prisma } from "../configs/database";

export async function getServerConfiguration(
  serverId: string,
) {
  const configuration =
    await findByServerId(serverId);

  if (!configuration) {
    return null;
  }

  const storedConfigurations =
    await findCommandConfigurationsByServerId(
      serverId,
    );

  const registeredCommands =
    getRegisteredCommands();

  const commands = registeredCommands.map(
    (command) => {
      const storedConfiguration =
        storedConfigurations.find(
          (config) =>
            config.commandName ===
            command.name,
        );

      if (storedConfiguration) {
        return storedConfiguration;
      }

      return {
        commandName: command.name,
        enabled: true,
        channelId:
          configuration.commandChannelId,
      };
    },
  );

  return {
    ...configuration,
    commands,
  };
}

export async function saveServerConfiguration(data: {
  serverId: string;
  commandChannelId: string;
  mirrorChannelId: string;
  commands: {
    commandName: string;
    enabled: boolean;
    channelId: string;
  }[];
}) {
  const server = await findById(data.serverId);

  if (!server) {
    throw new Error("SERVER_NOT_FOUND");
  }

  if (
    data.commandChannelId === data.mirrorChannelId
  ) {
    throw new Error(
      "Command and mirror channels must be different.",
    );
  }

  const registeredCommands =
    getRegisteredCommands();

  for (const command of data.commands) {
    const commandExists =
      registeredCommands.some(
        (registeredCommand) =>
          registeredCommand.name ===
          command.commandName,
      );

    if (!commandExists) {
      throw new Error(
        `Unsupported command: ${command.commandName}`,
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const configuration =
      await tx.serverConfiguration.upsert({
        where: {
          serverId: data.serverId,
        },
        create: {
          serverId: data.serverId,
          commandChannelId:
            data.commandChannelId,
          mirrorChannelId:
            data.mirrorChannelId,
        },
        update: {
          commandChannelId:
            data.commandChannelId,
          mirrorChannelId:
            data.mirrorChannelId,
        },
      });

    for (const command of data.commands) {
      await tx.commandConfiguration.upsert({
        where: {
          serverId_commandName: {
            serverId: data.serverId,
            commandName:
              command.commandName,
          },
        },
        create: {
          serverId: data.serverId,
          commandName:
            command.commandName,
          enabled: command.enabled,
          channelId: command.channelId,
        },
        update: {
          enabled: command.enabled,
          channelId: command.channelId,
        },
      });
    }

    return configuration;
  });
}