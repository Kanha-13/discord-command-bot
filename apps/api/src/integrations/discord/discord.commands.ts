import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../../../.env"),
});

const DISCORD_API_BASE = "https://discord.com/api/v10";

const applicationId = process.env.DISCORD_APPLICATION_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !botToken) {
  throw new Error(
    "DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required.",
  );
}

const commands = [
  {
    name: "status",
    description: "Check whether the bot is operational.",
  },
  {
    name: "report",
    description: "Submit a report.",
    options: [
      {
        name: "text",
        description: "The report text.",
        type: 3,
        required: true,
      },
    ],
  },
];

export async function registerGlobalCommands() {
  const response = await fetch(
    `${DISCORD_API_BASE}/applications/${applicationId}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Discord command registration failed: ${response.status} ${body}`,
    );
  }

  // Consume the response body before exiting.
  await response.text();

  console.log("Discord commands registered.");
}