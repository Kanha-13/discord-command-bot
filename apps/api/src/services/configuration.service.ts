import { findById } from "../repositories/server.repository";
import {
  findByServerId,
  upsertConfiguration,
} from "../repositories/configuration.repository";

export async function getServerConfiguration(
  serverId: string,
) {
  return findByServerId(serverId);
}

export async function saveServerConfiguration(data: {
  serverId: string;
  commandChannelId: string;
  mirrorChannelId: string;
}) {
  const server = await findById(data.serverId);

  if (!server) {
    throw new Error("SERVER_NOT_FOUND");
  }

  if (
    data.commandChannelId === data.mirrorChannelId
  ) {
    throw new Error(
      "Command and mirror channels must be different.",
    );
  }

  return upsertConfiguration(data);
}