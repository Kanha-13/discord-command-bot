import {
  createServer,
  findByGuildId,
} from "../repositories/server.repository";

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