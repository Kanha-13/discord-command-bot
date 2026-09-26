import { prisma } from "../configs/database";

export async function findCommandConfigurationsByServerId(
  serverId: string,
) {
  return prisma.commandConfiguration.findMany({
    where: {
      serverId,
    },
    orderBy: {
      commandName: "asc",
    },
  });
}

export async function findCommandConfiguration(
  serverId: string,
  commandName: string,
) {
  return prisma.commandConfiguration.findUnique({
    where: {
      serverId_commandName: {
        serverId,
        commandName,
      },
    },
  });
}

export async function upsertCommandConfiguration(data: {
  serverId: string;
  commandName: string;
  enabled: boolean;
  channelId: string;
}) {
  return prisma.commandConfiguration.upsert({
    where: {
      serverId_commandName: {
        serverId: data.serverId,
        commandName: data.commandName,
      },
    },
    create: data,
    update: {
      enabled: data.enabled,
      channelId: data.channelId,
    },
  });
}
