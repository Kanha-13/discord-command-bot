export type InteractionStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type ActionType =
  | "DISCORD_RESPONSE"
  | "MIRROR_NOTIFICATION";

export type ActionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED";

export interface InteractionAction {
  id: string;
  type: ActionType;
  status: ActionStatus;
  attempts: number;
  error?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface InteractionServer {
  id: string;
  guildId: string;
  name: string;
}

export interface CommandInteraction {
  id: string;
  interactionId: string;
  channelId: string;
  userDiscordId: string;
  commandName: string;
  payload: unknown;
  status: InteractionStatus;
  response?: string | null;
  error?: string | null;
  processedAt?: string | null;
  createdAt: string;
  server: InteractionServer;
  actions: InteractionAction[];
}

export interface InteractionListResponse {
  data: {
    items: CommandInteraction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}