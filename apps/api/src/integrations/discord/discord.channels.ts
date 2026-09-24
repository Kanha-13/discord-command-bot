import { discordRequest } from "./discord.client";

interface DiscordChannel {
  id: string;
  name?: string;
  type: number;
  guild_id?: string;
}

export async function getGuildChannels(
  guildId: string,
) {
  return discordRequest<DiscordChannel[]>(
    `/guilds/${guildId}/channels`,
  );
}