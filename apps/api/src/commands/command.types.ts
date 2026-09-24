export interface CommandContext {
  interactionId: string;
  guildId: string;
  channelId: string;
  userDiscordId: string;
  username: string;
  options: Record<string, unknown>;
}

export interface CommandResult {
  response: string;
  mirrorNotification: string;
}

export interface CommandHandler {
  name: string;
  execute(context: CommandContext): Promise<CommandResult>;
}