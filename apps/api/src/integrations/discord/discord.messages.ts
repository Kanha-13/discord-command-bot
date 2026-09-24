import { discordRequest } from "./discord.client";

interface DiscordMessage {
  id: string;
  channel_id: string;
  content: string;
}

export async function sendChannelMessage(
  channelId: string,
  content: string,
): Promise<DiscordMessage> {
  return discordRequest<DiscordMessage>(
    `/channels/${channelId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  );
}