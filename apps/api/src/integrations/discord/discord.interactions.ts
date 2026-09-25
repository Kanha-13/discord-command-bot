import { discordRequest } from "./discord.client";

interface InteractionMessageResponse {
  id: string;
  content: string;
}

export async function sendInteractionFollowUp(
  applicationId: string,
  interactionToken: string,
  content: string,
) {
  return discordRequest<InteractionMessageResponse>(
    `/webhooks/${applicationId}/${interactionToken}`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
  );
}