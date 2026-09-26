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

export async function openReportModal(
  interactionId: string,
  interactionToken: string,
) {
  return discordRequest(
    `/interactions/${interactionId}/${interactionToken}/callback`,
    {
      method: "POST",
      body: JSON.stringify({
        type: 9,
        data: {
          custom_id: "report_modal",
          title: "Submit a Report",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "report_text",
                  label: "Report",
                  style: 2,
                  placeholder: "Describe the issue...",
                  required: true,
                  min_length: 1,
                  max_length: 1000,
                },
              ],
            },
          ],
        },
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