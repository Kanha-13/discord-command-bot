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
  if (
    data.commandChannelId ===
    data.mirrorChannelId
  ) {
    throw new Error(
      "Command and mirror channels must be different.",
    );
  }

  return upsertConfiguration(data);
}