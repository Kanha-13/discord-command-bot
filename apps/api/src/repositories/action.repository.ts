import { prisma } from "../configs/database";
import { Prisma } from "../generated/client";

export async function createActions(
  interactionId: string,
  options: {
    mirror?: boolean;
  } = {},
) {
  const { mirror = true } = options;

  const data: Prisma.ActionCreateManyInput[] = [
    {
      interactionId,
      type: "DISCORD_RESPONSE",
    },
  ];

  if (mirror) {
    data.push({
      interactionId,
      type: "MIRROR_NOTIFICATION",
    });
  }

  return prisma.action.createMany({
    data,
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

export async function createActionAttempt(data: {
  actionId: string;
  attempt: number;
}) {
  return prisma.actionAttempt.create({
    data: {
      actionId: data.actionId,
      attempt: data.attempt,
      status: "PROCESSING",
    },
  });
}

export async function updateActionAttempt(
  id: string,
  data: {
    status?: "PROCESSING" | "SUCCESS" | "FAILED";
    error?: string;
    completedAt?: Date;
  },
) {
  return prisma.actionAttempt.update({
    where: {
      id,
    },
    data,
  });
}

export async function findActionAttempts(
  actionId: string,
) {
  return prisma.actionAttempt.findMany({
    where: {
      actionId,
    },
    orderBy: {
      attempt: "asc",
    },
  });
}