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
  commands: CommandConfiguration[];
  createdAt: string;
  updatedAt: string;
}

export interface CommandConfiguration {
  commandName: string;
  enabled: boolean;
  channelId: string;
}

export interface ApiResponse<T> {
  data: T;
}