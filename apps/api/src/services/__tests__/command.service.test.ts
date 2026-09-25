import { describe, expect, it } from "vitest";
import { executeCommand, isCommandAllowedInChannel } from "../command.service";
import { DiscordInteraction } from "../../integrations/discord/discord.types";

import { vi } from "vitest";

vi.mock("../../repositories/configuration.repository", () => ({
  findByServerId: vi.fn(),
}));

import { findByServerId } from "../../repositories/configuration.repository";

describe("command service", () => {
  it("executes the status command", async () => {
    const interaction: DiscordInteraction = {
      id: "interaction-1",
      application_id: "application-1",
      type: 2,
      guild_id: "guild-1",
      channel_id: "channel-1",
      token: "token-1",
      member: {
        user: {
          id: "user-1",
          username: "kanha",
        },
      },
      data: {
        id: "command-1",
        name: "status",
      },
    };

    const result =
      await executeCommand(interaction);

    expect(result.response).toBe(
      "🟢 Bot is operational.",
    );

    expect(result.mirrorNotification).toContain(
      "/status executed by",
    );
  });

  it("executes the report command", async () => {
    const interaction: DiscordInteraction = {
      id: "interaction-2",
      application_id: "application-1",
      type: 2,
      guild_id: "guild-1",
      channel_id: "channel-1",
      token: "token-2",
      member: {
        user: {
          id: "user-1",
          username: "kanha",
        },
      },
      data: {
        id: "command-2",
        name: "report",
        options: [
          {
            name: "text",
            type: 3,
            value: "Something is not working.",
          },
        ],
      },
    };

    const result =
      await executeCommand(interaction);

    expect(result.response).toContain(
      "Report received",
    );

    expect(result.response).toContain(
      "Something is not working.",
    );

    expect(result.mirrorNotification).toContain(
      "Something is not working.",
    );
  });
  it("rejects an empty report", async () => {
    const interaction: DiscordInteraction = {
      id: "interaction-3",
      application_id: "application-1",
      type: 2,
      guild_id: "guild-1",
      channel_id: "channel-1",
      token: "token-3",
      member: {
        user: {
          id: "user-1",
          username: "kanha",
        },
      },
      data: {
        id: "command-3",
        name: "report",
        options: [],
      },
    };

    await expect(
      executeCommand(interaction),
    ).rejects.toThrow(
      "Report text is required.",
    );
  });
  it("allows commands in the configured command channel", async () => {
    vi.mocked(findByServerId).mockResolvedValue({
      id: "config-1",
      serverId: "server-1",
      commandChannelId: "channel-1",
      mirrorChannelId: "channel-2",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result =
      await isCommandAllowedInChannel(
        "server-1",
        "channel-1",
      );

    expect(result).toEqual({
      allowed: true,
      reason: null,
    });
  });
  it("rejects commands from a different channel", async () => {
    vi.mocked(findByServerId).mockResolvedValue({
      id: "config-1",
      serverId: "server-1",
      commandChannelId: "channel-1",
      mirrorChannelId: "channel-2",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result =
      await isCommandAllowedInChannel(
        "server-1",
        "channel-999",
      );

    expect(result).toEqual({
      allowed: false,
      reason: "INVALID_CHANNEL",
    });
  });
  it("rejects commands when the server is not configured", async () => {
  vi.mocked(findByServerId).mockResolvedValue(
    null,
  );

  const result =
    await isCommandAllowedInChannel(
      "server-1",
      "channel-1",
    );

  expect(result).toEqual({
    allowed: false,
    reason: "NOT_CONFIGURED",
  });
});
});