export const DiscordInteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  MODAL_SUBMIT: 5,
} as const;

export type DiscordInteractionType =
  (typeof DiscordInteractionType)[keyof typeof DiscordInteractionType];

export interface DiscordCommandOption {
  name: string;
  type: number;
  value?: string | number | boolean;
}

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

  user?: {
    id: string;
    username: string;
    global_name?: string;
  };

  data?: {
    id: string;
    name?: string;
    custom_id?: string;
    component_type?: number;
    options?: DiscordCommandOption[];
    components?: DiscordModalComponent[];
  };

  token: string;
}

export interface DiscordModalComponent {
  type: number;
  custom_id: string;
  value?: string;
  components?: DiscordModalComponent[];
}