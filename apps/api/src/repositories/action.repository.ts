import {prisma} from "../configs/database";

export async function createActions(
  interactionId: string,
) {
  return prisma.action.createMany({
    data: [
      {
        interactionId,
        type: "DISCORD_RESPONSE",
      },
      {
        interactionId,
        type: "MIRROR_NOTIFICATION",
      },
    ],
  });
}

export async function findActionsByInteractionId(
  interactionId: string,
) {
  return prisma.action.findMany({
    where: {
      interactionId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findAction(
  interactionId: string,
  type: "DISCORD_RESPONSE" | "MIRROR_NOTIFICATION",
) {
  return prisma.action.findFirst({
    where: {
      interactionId,
      type,
    },
  });
}

export async function updateAction(
  id: string,
  data: {
    status?: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
    attempts?: number;
    error?: string;
    completedAt?: Date;
  },
) {
  return prisma.action.update({
    where: {
      id,
    },
    data,
  });
}