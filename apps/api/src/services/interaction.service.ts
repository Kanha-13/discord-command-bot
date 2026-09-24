import {
  createInteraction,
  findByInteractionId,
  updateInteraction,
} from "../repositories/interaction.repository";
import { createActions } from "../repositories/action.repository";

export async function getOrCreateInteraction(data: {
  interactionId: string;
  serverId: string;
  channelId: string;
  userDiscordId: string;
  commandName: string;
  payload: object;
}) {
  const existing = await findByInteractionId(data.interactionId);

  if (existing) {
    return {
      interaction: existing,
      duplicate: true,
    };
  }

  const interaction = await createInteraction(data);

  await createActions(interaction.id);

  return {
    interaction,
    duplicate: false,
  };
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