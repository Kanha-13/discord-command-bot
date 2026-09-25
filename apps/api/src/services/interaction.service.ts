import { Prisma } from "../generated/client";

import {
  createInteraction,
  findByInteractionId,
  updateInteraction,
} from "../repositories/interaction.repository";
import { createActions } from "../repositories/action.repository";

import {
  findInteractionById,
  findInteractions,
} from "../repositories/interaction.repository";
import type { InteractionStatus } from "../generated/client";
import { findByServerId } from "../repositories/configuration.repository";

interface GetInteractionsParams {
  page?: number;
  limit?: number;
  serverId?: string;
  command?: string;
  status?: InteractionStatus;
}

export async function getOrCreateInteraction(data: {
  interactionId: string;
  serverId: string;
  channelId: string;
  userDiscordId: string;
  commandName: string;
  payload: object;
}) {
  const existing = await findByInteractionId(
    data.interactionId,
  );

  if (existing) {
    return {
      interaction: existing,
      duplicate: true,
    };
  }

  try {
    const interaction = await createInteraction(data);

    await createActions(interaction.id);

    return {
      interaction,
      duplicate: false,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingInteraction =
        await findByInteractionId(
          data.interactionId,
        );

      if (existingInteraction) {
        return {
          interaction: existingInteraction,
          duplicate: true,
        };
      }
    }

    throw error;
  }
}

export async function markInteractionProcessing(
  id: string,
) {
  return updateInteraction(id, {
    status: "PROCESSING",
  });
}

export async function markInteractionCompleted(
  id: string,
  response: string,
) {
  return updateInteraction(id, {
    status: "COMPLETED",
    response,
    processedAt: new Date(),
  });
}

export async function markInteractionFailed(
  id: string,
  error: string,
) {
  return updateInteraction(id, {
    status: "FAILED",
    error,
    processedAt: new Date(),
  });
}

export async function getInteractions(
  params: GetInteractionsParams = {},
) {
  const page = Math.max(1, params.page ?? 1);

  const limit = Math.min(
    100,
    Math.max(1, params.limit ?? 20),
  );

  const result = await findInteractions({
    page,
    limit,
    serverId: params.serverId,
    command: params.command,
    status: params.status,
  });

  return {
    items: result.items,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function getInteractionById(id: string) {
  return findInteractionById(id);
}

export async function getInteractionConfiguration(
  serverId: string,
) {
  return findByServerId(serverId);
}