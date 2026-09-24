import {
  findAction,
  updateAction,
} from "../repositories/action.repository";

import {
  sendChannelMessage,
} from "../integrations/discord/discord.messages";

import {
  getServerConfiguration,
} from "./configuration.service";

const MAX_ATTEMPTS = 3;

function getRetryDelay(attempt: number) {
  return 500 * 2 ** (attempt - 1);
}

export async function executeMirrorAction(data: {
  interactionId: string;
  serverId: string;
  message: string;
}) {
  const action = await findAction(
    data.interactionId,
    "MIRROR_NOTIFICATION",
  );

  if (!action) {
    throw new Error(
      "Mirror notification action was not found.",
    );
  }

  const configuration =
    await getServerConfiguration(data.serverId);

  if (!configuration) {
    await updateAction(action.id, {
      status: "FAILED",
      error: "Server configuration not found.",
    });

    return false;
  }

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    await updateAction(action.id, {
      status: "PROCESSING",
      attempts: attempt,
      error: undefined,
    });

    try {
      await sendChannelMessage(
        configuration.mirrorChannelId,
        data.message,
      );

      await updateAction(action.id, {
        status: "SUCCESS",
        attempts: attempt,
        completedAt: new Date(),
      });

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Discord API error.";

      await updateAction(action.id, {
        status:
          attempt === MAX_ATTEMPTS
            ? "FAILED"
            : "PROCESSING",
        attempts: attempt,
        error: message,
      });

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            getRetryDelay(attempt),
          ),
        );
      }
    }
  }

  return false;
}

export async function markDiscordResponseSuccess(
  interactionId: string,
) {
  const action = await findAction(
    interactionId,
    "DISCORD_RESPONSE",
  );

  if (!action) {
    throw new Error(
      "Discord response action was not found.",
    );
  }

  return updateAction(action.id, {
    status: "SUCCESS",
    attempts: 1,
    completedAt: new Date(),
  });
}