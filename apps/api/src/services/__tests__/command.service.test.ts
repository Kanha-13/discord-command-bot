import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  executeCommand,
  isCommandAllowedInChannel,
} from "../command.service";

import { DiscordInteraction } from "../../integrations/discord/discord.types";

import { getCommandConfiguration } from "../command-configuration.service";
import { getInteractionConfiguration } from "../../services/interaction.service";

vi.mock("../command-configuration.service", () => ({
  getCommandConfiguration: vi.fn(),
}));

vi.mock("../../services/interaction.service", () => ({
  getInteractionConfiguration: vi.fn(),
}));

const mockedGetCommandConfiguration = vi.mocked(
  getCommandConfiguration,
);

const mockedGetInteractionConfiguration = vi.mocked(
  getInteractionConfiguration,
);

describe("command service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("executeCommand", () => {
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

      const result = await executeCommand(interaction);

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

      const result = await executeCommand(interaction);

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
  });

  describe("isCommandAllowedInChannel", () => {
    it("allows an enabled command in its configured channel", async () => {
      mockedGetCommandConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandName: "report",
        enabled: true,
        channelId: "channel-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-1",
      );

      expect(result).toEqual({
        allowed: true,
        reason: null,
      });

      expect(
        mockedGetInteractionConfiguration,
      ).not.toHaveBeenCalled();
    });

    it("rejects a disabled command", async () => {
      mockedGetCommandConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandName: "report",
        enabled: false,
        channelId: "channel-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-1",
      );

      expect(result).toEqual({
        allowed: false,
        reason: "COMMAND_DISABLED",
      });
    });

    it("rejects an enabled command in the wrong channel", async () => {
      mockedGetCommandConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandName: "report",
        enabled: true,
        channelId: "channel-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-2",
      );

      expect(result).toEqual({
        allowed: false,
        reason: "INVALID_CHANNEL",
      });
    });

    it("falls back to server configuration when command configuration does not exist", async () => {
      mockedGetCommandConfiguration.mockResolvedValue(
        null,
      );

      mockedGetInteractionConfiguration.mockResolvedValue({
        id: "server-config-1",
        serverId: "server-1",
        commandChannelId: "channel-1",
        mirrorChannelId: "channel-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-1",
      );

      expect(result).toEqual({
        allowed: true,
        reason: null,
      });

      expect(
        mockedGetInteractionConfiguration,
      ).toHaveBeenCalledWith("server-1");
    });

    it("rejects when fallback server configuration uses another channel", async () => {
      mockedGetCommandConfiguration.mockResolvedValue(
        null,
      );

      mockedGetInteractionConfiguration.mockResolvedValue({
        id: "server-config-1",
        serverId: "server-1",
        commandChannelId: "channel-1",
        mirrorChannelId: "channel-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-3",
      );

      expect(result).toEqual({
        allowed: false,
        reason: "INVALID_CHANNEL",
      });
    });

    it("rejects when the server is not configured", async () => {
      mockedGetCommandConfiguration.mockResolvedValue(
        null,
      );

      mockedGetInteractionConfiguration.mockResolvedValue(
        null,
      );

      const result = await isCommandAllowedInChannel(
        "server-1",
        "report",
        "channel-1",
      );

      expect(result).toEqual({
        allowed: false,
        reason: "NOT_CONFIGURED",
      });
    });
  });
});
