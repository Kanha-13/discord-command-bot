import { discordRequest } from "./discord.client";

interface InteractionMessageResponse {
  id: string;
  content: string;
}

interface DiscordButton {
  type: 2;
  style: 1;
  label: string;
  custom_id: string;
}

interface DiscordActionRow {
  type: 1;
  components: DiscordButton[];
}

export async function sendInteractionFollowUp(
  applicationId: string,
  interactionToken: string,
  content: string,
  components?: DiscordActionRow[],
) {
  return discordRequest<InteractionMessageResponse>(
    `/webhooks/${applicationId}/${interactionToken}`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
        ...(components ? { components } : {}),
      }),
    },
  );
}

interface InteractionMessageResponse {
  id: string;
  content: string;
}

export async function sendInteractionResponse(
  interactionId: string,
  interactionToken: string,
  data: {
    content: string;
  },
) {
  return discordRequest(
    `/interactions/${interactionId}/${interactionToken}/callback`,
    {
      method: "POST",
      body: JSON.stringify({
        type: 4,
        data,
      }),
    },
  );
}

export async function updateInteractionResponse(
  applicationId: string,
  interactionToken: string,
  content: string,
) {
  return discordRequest(
    `/webhooks/${applicationId}/${interactionToken}/messages/@original`,
    {
      method: "PATCH",
      body: JSON.stringify({
        content,
        components: statusRefreshButton,
      }),
    },
  );
}

export const statusRefreshButton: DiscordActionRow[] = [
  {
    type: 1,
    components: [
      {
        type: 2,
        style: 1,
        label: "Refresh Status",
        custom_id: "status_refresh",
      },
    ],
  },
];