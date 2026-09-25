import { prisma } from "../configs/database";
import type { InteractionStatus } from "../generated/client";

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



interface FindInteractionsParams {
  page: number;
  limit: number;
  serverId?: string;
  command?: string;
  status?: InteractionStatus;
}

export async function findInteractions(
  params: FindInteractionsParams,
) {
  const {
    page,
    limit,
    serverId,
    command,
    status,
  } = params;
  
  const where = {
    ...(serverId ? { serverId } : {}),
    ...(command ? { commandName: command } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.commandInteraction.findMany({
      where,
      include: {
        server: true,
        actions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.commandInteraction.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function findInteractionById(id: string) {
  return prisma.commandInteraction.findUnique({
    where: {
      id,
    },
    include: {
      server: true,
      actions: true,
    },
  });
}