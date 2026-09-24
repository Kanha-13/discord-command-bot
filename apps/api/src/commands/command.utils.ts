import type { DiscordCommandOption } from "../integrations/discord/discord.types";

export function optionsToRecord(
  options: DiscordCommandOption[] = [],
): Record<string, unknown> {
  return Object.fromEntries(
    options.map((option) => [
      option.name,
      option.value,
    ]),
  );
}