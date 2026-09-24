import type { Request, Response } from "express";

import {
  getServerConfiguration,
  saveServerConfiguration,
} from "../services/configuration.service";
import { serverConfigurationSchema } from "../utils/validation";

export async function getConfiguration(
  req: Request,
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
  req: Request,
  res: Response,
) {

  const result =
    serverConfigurationSchema.safeParse(
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

  const configuration =
    await saveServerConfiguration({
      serverId: req.params.id,
      ...result.data,
    });

  return res.json({
    data: configuration,
  });
}