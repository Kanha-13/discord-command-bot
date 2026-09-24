export const DiscordInteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
} as const;

export type DiscordInteractionType =
  (typeof DiscordInteractionType)[keyof typeof DiscordInteractionType];

export interface DiscordInteraction {
  id: string;
  application_id: string;
  type: DiscordInteractionType;
  guild_id?: string;
  channel_id?: string;
  member?: {
    user?: {
      id: string;
      username: string;
      global_name?: string;
    };
  };
  data?: {
    id: string;
    name: string;
    options?: Array<{
      name: string;
      type: number;
      value?: string | number | boolean;
    }>;
  };
  token: string;
}