import { prisma } from "../configs/database";

export async function findByServerId(
  serverId: string,
) {
  return prisma.serverConfiguration.findUnique({
    where: {
      serverId,
    },
  });
}

export async function upsertConfiguration(data: {
  serverId: string;
  commandChannelId: string;
  mirrorChannelId: string;
}) {
  return prisma.serverConfiguration.upsert({
    where: {
      serverId: data.serverId,
    },
    create: data,
    update: {
      commandChannelId: data.commandChannelId,
      mirrorChannelId: data.mirrorChannelId,
    },
  });
}