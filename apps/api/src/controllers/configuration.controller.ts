import type { Request, Response } from "express";

import {
  getServerConfiguration,
  saveServerConfiguration,
} from "../services/configuration.service";
import { serverConfigurationSchema } from "../utils/validation";

interface IdParams {
  id: string;
}

export async function getConfiguration(
  req: Request<IdParams>,
  res: Response,
) {
  const configuration =
    await getServerConfiguration(req.params.id);

  if (!configuration) {
    return res.status(404).json({
      error: {
        code: "CONFIGURATION_NOT_FOUND",
        message: "Server configuration was not found.",
      },
    });
  }

  return res.json({
    data: configuration,
  });
}

export async function updateConfiguration(
  req: Request<IdParams>,
  res: Response,
) {
  const result = serverConfigurationSchema.safeParse(
    req.body,
  );

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid server configuration.",
      },
    });
  }

  try {
    const configuration =
      await saveServerConfiguration({
        serverId: req.params.id,
        ...result.data,
      });

    return res.json({
      data: configuration,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SERVER_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code: "SERVER_NOT_FOUND",
          message: "Discord server was not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Command and mirror channels must be different."
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_CONFIGURATION",
          message:
            "Command and mirror channels must be different.",
        },
      });
    }

    throw error;
  }
}