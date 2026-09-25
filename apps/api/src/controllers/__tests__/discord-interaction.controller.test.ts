import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Request, Response } from "express";

import {
  handleDiscordInteraction,
} from "../discord-interaction.controller";

vi.mock("../../integrations/discord/discord.interactions", () => ({
  sendInteractionFollowUp: vi.fn(),
}));

vi.mock("../../services/action.service", () => ({
  executeMirrorAction: vi.fn(),
  markDiscordResponseSuccess: vi.fn(),
}));

vi.mock("../../services/interaction.service", () => ({
  getOrCreateInteraction: vi.fn(),
  markInteractionCompleted: vi.fn(),
  markInteractionFailed: vi.fn(),
  markInteractionProcessing: vi.fn(),
}));

vi.mock("../../services/command.service", () => ({
  executeCommand: vi.fn(),
  isCommandAllowedInChannel: vi.fn(),
}));

vi.mock("../../services/configuration.service", () => ({
  getServerConfiguration: vi.fn(),
}));

vi.mock("../../services/server.service", () => ({
  getOrCreateServer: vi.fn(),
}));

import {
  executeMirrorAction,
  markDiscordResponseSuccess,
} from "../../services/action.service";

import {
  getOrCreateInteraction,
  markInteractionCompleted,
  markInteractionFailed,
  markInteractionProcessing,
} from "../../services/interaction.service";

import {
  executeCommand,
  isCommandAllowedInChannel,
} from "../../services/command.service";

import { getOrCreateServer } from "../../services/server.service";

import {
  sendInteractionFollowUp,
} from "../../integrations/discord/discord.interactions";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    headersSent: false,
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("handleDiscordInteraction", () => {
  it("responds to Discord PING with PONG", async () => {
    const req = {
      body: Buffer.from(
        JSON.stringify({
          type: 1,
        }),
      ),
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.json).toHaveBeenCalledWith({
      type: 1,
    });
  });
  it("rejects requests without a raw body", async () => {
    const req = {
      body: {},
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "RAW_BODY_REQUIRED",
        message:
          "Raw request body is required.",
      },
    });
  });
  it("rejects unsupported interaction types", async () => {
    const req = {
      body: Buffer.from(
        JSON.stringify({
          type: 3,
        }),
      ),
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "UNSUPPORTED_INTERACTION",
        message:
          "Unsupported Discord interaction type.",
      },
    });
  });
  it("rejects a command without a guild", async () => {
    const req = {
      body: Buffer.from(
        JSON.stringify({
          type: 2,
          id: "interaction-1",
          application_id: "application-1",
          channel_id: "channel-1",
          token: "token-1",
          data: {
            id: "command-1",
            name: "status",
          },
          member: {
            user: {
              id: "user-1",
              username: "kanha",
            },
          },
        }),
      ),
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "GUILD_REQUIRED",
        message:
          "This command must be used inside a Discord server.",
      },
    });
  });
  it("rejects a command without a channel", async () => {
    const req = {
      body: Buffer.from(
        JSON.stringify({
          type: 2,
          id: "interaction-1",
          application_id: "application-1",
          guild_id: "guild-1",
          token: "token-1",
          data: {
            id: "command-1",
            name: "status",
          },
          member: {
            user: {
              id: "user-1",
              username: "kanha",
            },
          },
        }),
      ),
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "CHANNEL_REQUIRED",
        message:
          "Discord channel information is missing.",
      },
    });
  });
  it("rejects a command without command data", async () => {
    const req = {
      body: Buffer.from(
        JSON.stringify({
          type: 2,
          id: "interaction-1",
          application_id: "application-1",
          guild_id: "guild-1",
          channel_id: "channel-1",
          token: "token-1",
          member: {
            user: {
              id: "user-1",
              username: "kanha",
            },
          },
        }),
      ),
    } as any;

    const res = createResponse();

    await handleDiscordInteraction(
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "COMMAND_DATA_REQUIRED",
        message:
          "Command data is missing.",
      },
    });
  });
  it("should complete the interaction when Discord response succeeds but mirror fails", async () => {
    vi.mocked(getOrCreateServer).mockResolvedValue({
      id: "server-1",
      guildId: "guild-1",
      name: "Test Server",
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(getOrCreateInteraction).mockResolvedValue({
      duplicate: false,
      interaction: {
        id: "interaction-db-1",
      },
    } as never);

    vi.mocked(markInteractionProcessing).mockResolvedValue(
      {} as never,
    );

    vi.mocked(isCommandAllowedInChannel).mockResolvedValue({
      allowed: true,
      reason: null,
    });

    vi.mocked(executeCommand).mockResolvedValue({
      response: "📋 Report received.",
      mirrorNotification: "🚨 New Report",
    });

    vi.mocked(markDiscordResponseSuccess).mockResolvedValue(
      {} as never,
    );

    vi.mocked(executeMirrorAction).mockRejectedValue(
      new Error("Mirror Discord API failed"),
    );

    vi.mocked(markInteractionCompleted).mockResolvedValue(
      {} as never,
    );

    vi.mocked(markInteractionFailed).mockResolvedValue(
      {} as never,
    );

    const interaction = {
      id: "discord-interaction-1",
      application_id: "application-1",
      type: 2,
      guild_id: "guild-1",
      channel_id: "command-channel",
      token: "interaction-token",
      member: {
        user: {
          id: "user-1",
          username: "test-user",
        },
      },
      data: {
        id: "command-1",
        name: "report",
        options: [
          {
            name: "text",
            type: 3,
            value: "Something went wrong",
          },
        ],
      },
    };

    const req = {
      body: Buffer.from(JSON.stringify(interaction)),
    } as unknown as Request;

    const json = vi.fn();
    const status = vi.fn().mockReturnThis();

    const res = {
      json,
      status,
      headersSent: false,
    } as unknown as Response;

    await handleDiscordInteraction(req, res);

    // Initial Discord acknowledgement.
    expect(json).toHaveBeenCalledWith({
      type: 5,
    });

    // Allow the background processInteraction() to finish.
    await new Promise((resolve) =>
      setTimeout(resolve, 0),
    );

    expect(getOrCreateServer).toHaveBeenCalled();
    expect(getOrCreateInteraction).toHaveBeenCalled();
    expect(markInteractionProcessing).toHaveBeenCalled();
    expect(isCommandAllowedInChannel).toHaveBeenCalled();
    expect(executeCommand).toHaveBeenCalled();

    expect(markDiscordResponseSuccess).toHaveBeenCalledWith(
      "interaction-db-1",
    );

    expect(
      executeMirrorAction,
    ).toHaveBeenCalledWith({
      interactionId: "interaction-db-1",
      serverId: "server-1",
      message: "🚨 New Report",
    });

    // Primary Discord response succeeded,
    // therefore the interaction is still completed.
    expect(
      markInteractionCompleted,
    ).toHaveBeenCalledWith(
      "interaction-db-1",
      "📋 Report received.",
    );

    // Mirror failure must NOT mark the whole interaction failed.
    expect(
      markInteractionFailed,
    ).not.toHaveBeenCalled();
  });
  vi.mocked(sendInteractionFollowUp).mockResolvedValue(
  {} as never,
);
});
