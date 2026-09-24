import { prisma } from "../configs/database";

export async function findByInteractionId(
  interactionId: string,
) {
  return prisma.commandInteraction.findUnique({
    where: {
      interactionId,
    },
  });
}

export async function createInteraction(data: {
  interactionId: string;
  serverId: string;
  channelId: string;
  userDiscordId: string;
  commandName: string;
  payload: object;
}) {
  return prisma.commandInteraction.create({
    data: {
      interactionId: data.interactionId,
      serverId: data.serverId,
      channelId: data.channelId,
      userDiscordId: data.userDiscordId,
      commandName: data.commandName,
      payload: data.payload,
    },
  });
}

export async function updateInteraction(
  id: string,
  data: {
    status?: "RECEIVED" | "PROCESSING" | "COMPLETED" | "FAILED";
    response?: string;
    error?: string;
    processedAt?: Date;
  },
) {
  return prisma.commandInteraction.update({
    where: {
      id,
    },
    data,
  });
}