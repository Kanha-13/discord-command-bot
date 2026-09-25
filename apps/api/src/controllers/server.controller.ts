import type { Request, Response } from "express";

import {
  getServerById,
  getServerChannels,
  getServers,
} from "../services/server.service";

interface IdParams {
  id: string;
}

export async function listServers(
  _req: Request,
  res: Response,
) {
  const servers = await getServers();

  return res.json({
    data: servers,
  });
}

export async function getServer(
  req: Request<IdParams>,
  res: Response,
) {
  const server = await getServerById(req.params.id);

  if (!server) {
    return res.status(404).json({
      error: {
        code: "SERVER_NOT_FOUND",
        message: "Discord server was not found.",
      },
    });
  }

  return res.json({
    data: server,
  });
}

export async function listServerChannels(
  req: Request<IdParams>,
  res: Response,
) {
  try {
    const channels = await getServerChannels(
      req.params.id,
    );

    return res.json({
      data: channels,
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

    throw error;
  }
}