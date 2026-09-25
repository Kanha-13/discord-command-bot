export interface DiscordServer {
  id: string;
  guildId: string;
  name: string;
  iconUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
}

export interface ServerConfiguration {
  id: string;
  serverId: string;
  commandChannelId: string;
  mirrorChannelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
}