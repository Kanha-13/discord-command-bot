import {
  findCommandConfiguration,
  findCommandConfigurationsByServerId,
  upsertCommandConfiguration,
} from "../repositories/command-configuration.repository";

import {
  getRegisteredCommands,
} from "../commands/command.registry";

export async function getCommandConfigurations(
  serverId: string,
) {
  return findCommandConfigurationsByServerId(serverId);
}

export async function getCommandConfiguration(
  serverId: string,
  commandName: string,
) {
  return findCommandConfiguration(
    serverId,
    commandName,
  );
}

export async function saveCommandConfiguration(data: {
  serverId: string;
  commandName: string;
  enabled: boolean;
  channelId: string;
}) {
  const registeredCommands =
    getRegisteredCommands();

  const commandExists = registeredCommands.some(
    (command) =>
      command.name === data.commandName,
  );

  if (!commandExists) {
    throw new Error(
      `Unsupported command: ${data.commandName}`,
    );
  }

  return upsertCommandConfiguration(data);
}