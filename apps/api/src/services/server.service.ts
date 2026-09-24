import {
  createServer,
  findAll,
  findByGuildId,
  findById,
} from "../repositories/server.repository";
import {
  getGuildChannels,
} from "../integrations/discord/discord.channels";

export async function getServers() {
  return findAll();
}

export async function getServerById(id: string) {
  return findById(id);
}

export async function getOrCreateServer(data: {
  guildId: string;
  name?: string;
}) {
  const existing = await findByGuildId(data.guildId);

  if (existing) {
    return existing;
  }

  return createServer({
    guildId: data.guildId,
    name: data.name ?? `Discord Server ${data.guildId}`,
  });
}

export async function getServerChannels(
  serverId: string,
) {
  const server = await findById(serverId);

  if (!server) {
    throw new Error("SERVER_NOT_FOUND");
  }

  const channels = await getGuildChannels(
    server.guildId,
  );

  return channels
    .filter((channel) => channel.type === 0)
    .map((channel) => ({
      id: channel.id,
      name: channel.name ?? "Unnamed Channel",
    }));
}