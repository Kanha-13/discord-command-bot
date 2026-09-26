import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  executeMirrorAction,
  markDiscordResponseSuccess,
} from "../action.service";

import {
  createActionAttempt,
  findAction,
  updateAction,
  updateActionAttempt,
} from "../../repositories/action.repository";

import {
  sendChannelMessage,
} from "../../integrations/discord/discord.messages";

import {
  getServerConfiguration,
} from "../configuration.service";

vi.mock("../../repositories/action.repository", () => ({
  findAction: vi.fn(),
  updateAction: vi.fn(),
  createActionAttempt: vi.fn(),
  updateActionAttempt: vi.fn(),
}));

vi.mock(
  "../../integrations/discord/discord.messages",
  () => ({
    sendChannelMessage: vi.fn(),
  }),
);

vi.mock("../configuration.service", () => ({
  getServerConfiguration: vi.fn(),
}));

const mockedFindAction = vi.mocked(findAction);
const mockedUpdateAction = vi.mocked(updateAction);
const mockedCreateActionAttempt = vi.mocked(createActionAttempt);
const mockedUpdateActionAttempt = vi.mocked(updateActionAttempt);
const mockedSendChannelMessage =
  vi.mocked(sendChannelMessage);
const mockedGetServerConfiguration =
  vi.mocked(getServerConfiguration);

describe("action.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedCreateActionAttempt.mockImplementation(
      async ({ actionId, attempt }) =>
        ({
          id: `attempt-${attempt}`,
          actionId,
          attempt,
          status: "PROCESSING",
          error: null,
          createdAt: new Date(),
          completedAt: null,
        }) as never,
    );

    mockedUpdateActionAttempt.mockResolvedValue(
      {} as never,
    );
  });

  describe("executeMirrorAction", () => {
    it("should successfully execute the mirror action on the first attempt", async () => {
      mockedFindAction.mockResolvedValue({
        id: "action-1",
        interactionId: "interaction-1",
        type: "MIRROR_NOTIFICATION",
        status: "PENDING",
        attempts: 0,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      });

      mockedGetServerConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandChannelId: "command-channel",
        mirrorChannelId: "mirror-channel",
        createdAt: new Date(),
        updatedAt: new Date(),
        commands: [],
      });

      mockedSendChannelMessage.mockResolvedValue({
        id: "message-1",
      } as never);

      mockedUpdateAction.mockResolvedValue(
        {} as never,
      );

      const result = await executeMirrorAction({
        interactionId: "interaction-1",
        serverId: "server-1",
        message: "Test notification",
      });

      expect(result).toBe(true);

      expect(
        mockedSendChannelMessage,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockedSendChannelMessage,
      ).toHaveBeenCalledWith(
        "mirror-channel",
        "Test notification",
      );

      expect(mockedCreateActionAttempt).toHaveBeenCalledTimes(1);

      expect(mockedCreateActionAttempt).toHaveBeenCalledWith({
        actionId: "action-1",
        attempt: 1,
      });

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-1",
        expect.objectContaining({
          status: "SUCCESS",
        }),
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        expect.objectContaining({
          status: "PROCESSING",
          attempts: 1,
        }),
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        expect.objectContaining({
          status: "SUCCESS",
          attempts: 1,
        }),
      );
    });

    it("should retry when the mirror notification fails", async () => {
      mockedFindAction.mockResolvedValue({
        id: "action-1",
        interactionId: "interaction-1",
        type: "MIRROR_NOTIFICATION",
        status: "PENDING",
        attempts: 0,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      });

      mockedGetServerConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandChannelId: "command-channel",
        mirrorChannelId: "mirror-channel",
        createdAt: new Date(),
        updatedAt: new Date(),
        commands: [],
      });

      mockedSendChannelMessage
        .mockRejectedValueOnce(
          new Error("Discord API unavailable"),
        )
        .mockResolvedValueOnce({
          id: "message-1",
        } as never);

      mockedUpdateAction.mockResolvedValue(
        {} as never,
      );

      const result = await executeMirrorAction({
        interactionId: "interaction-1",
        serverId: "server-1",
        message: "Test notification",
      });

      expect(result).toBe(true);

      expect(
        mockedSendChannelMessage,
      ).toHaveBeenCalledTimes(2);

      expect(mockedSendChannelMessage).toHaveBeenNthCalledWith(
        1,
        "mirror-channel",
        "Test notification",
      );

      expect(mockedSendChannelMessage).toHaveBeenNthCalledWith(
        2,
        "mirror-channel",
        "Test notification",
      );

      expect(mockedCreateActionAttempt).toHaveBeenCalledTimes(2);

      expect(mockedCreateActionAttempt).toHaveBeenNthCalledWith(
        1,
        {
          actionId: "action-1",
          attempt: 1,
        },
      );

      expect(mockedCreateActionAttempt).toHaveBeenNthCalledWith(
        2,
        {
          actionId: "action-1",
          attempt: 2,
        },
      );

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-1",
        expect.objectContaining({
          status: "FAILED",
          error: "Discord API unavailable",
        }),
      );

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-2",
        expect.objectContaining({
          status: "SUCCESS",
        }),
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        expect.objectContaining({
          status: "PROCESSING",
          attempts: 1,
          error: "Discord API unavailable",
        }),
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        expect.objectContaining({
          status: "SUCCESS",
          attempts: 2,
        }),
      );
    });

    it("should fail after three unsuccessful attempts", async () => {
      mockedFindAction.mockResolvedValue({
        id: "action-1",
        interactionId: "interaction-1",
        type: "MIRROR_NOTIFICATION",
        status: "PENDING",
        attempts: 0,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      });

      mockedGetServerConfiguration.mockResolvedValue({
        id: "config-1",
        serverId: "server-1",
        commandChannelId: "command-channel",
        mirrorChannelId: "mirror-channel",
        createdAt: new Date(),
        updatedAt: new Date(),
        commands: [],
      });

      mockedSendChannelMessage.mockRejectedValue(
        new Error("Discord API unavailable"),
      );

      mockedUpdateAction.mockResolvedValue(
        {} as never,
      );

      const result = await executeMirrorAction({
        interactionId: "interaction-1",
        serverId: "server-1",
        message: "Test notification",
      });

      expect(result).toBe(false);

      expect(
        mockedSendChannelMessage,
      ).toHaveBeenCalledTimes(3);

      expect(mockedCreateActionAttempt).toHaveBeenCalledTimes(3);

      expect(mockedCreateActionAttempt).toHaveBeenNthCalledWith(
        1,
        {
          actionId: "action-1",
          attempt: 1,
        },
      );

      expect(mockedCreateActionAttempt).toHaveBeenNthCalledWith(
        2,
        {
          actionId: "action-1",
          attempt: 2,
        },
      );

      expect(mockedCreateActionAttempt).toHaveBeenNthCalledWith(
        3,
        {
          actionId: "action-1",
          attempt: 3,
        },
      );

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-1",
        expect.objectContaining({
          status: "FAILED",
          error: "Discord API unavailable",
        }),
      );

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-2",
        expect.objectContaining({
          status: "FAILED",
          error: "Discord API unavailable",
        }),
      );

      expect(mockedUpdateActionAttempt).toHaveBeenCalledWith(
        "attempt-3",
        expect.objectContaining({
          status: "FAILED",
          error: "Discord API unavailable",
        }),
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        expect.objectContaining({
          status: "FAILED",
          attempts: 3,
          error: "Discord API unavailable",
        }),
      );
    });

    it("should mark the action as failed when configuration is missing", async () => {
      mockedFindAction.mockResolvedValue({
        id: "action-1",
        interactionId: "interaction-1",
        type: "MIRROR_NOTIFICATION",
        status: "PENDING",
        attempts: 0,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      });

      mockedGetServerConfiguration.mockResolvedValue(
        null,
      );

      mockedUpdateAction.mockResolvedValue(
        {} as never,
      );

      const result = await executeMirrorAction({
        interactionId: "interaction-1",
        serverId: "server-1",
        message: "Test notification",
      });

      expect(result).toBe(false);

      expect(
        mockedSendChannelMessage,
      ).not.toHaveBeenCalled();

      expect(
        mockedCreateActionAttempt,
      ).not.toHaveBeenCalled();

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "action-1",
        {
          status: "FAILED",
          error: "Server configuration not found.",
        },
      );
    });

    it("should throw when the mirror action does not exist", async () => {
      mockedFindAction.mockResolvedValue(null);

      await expect(
        executeMirrorAction({
          interactionId: "interaction-1",
          serverId: "server-1",
          message: "Test notification",
        }),
      ).rejects.toThrow(
        "Mirror notification action was not found.",
      );

      expect(
        mockedSendChannelMessage,
      ).not.toHaveBeenCalled();

      expect(
        mockedCreateActionAttempt,
      ).not.toHaveBeenCalled();

      expect(
        mockedUpdateAction,
      ).not.toHaveBeenCalled();
    });
  });

  describe("markDiscordResponseSuccess", () => {
    it("should mark the Discord response action as successful", async () => {
      mockedFindAction.mockResolvedValue({
        id: "response-action-1",
        interactionId: "interaction-1",
        type: "DISCORD_RESPONSE",
        status: "PENDING",
        attempts: 0,
        error: null,
        createdAt: new Date(),
        completedAt: null,
      });

      mockedUpdateAction.mockResolvedValue(
        {} as never,
      );

      await markDiscordResponseSuccess(
        "interaction-1",
      );

      expect(mockedFindAction).toHaveBeenCalledWith(
        "interaction-1",
        "DISCORD_RESPONSE",
      );

      expect(mockedUpdateAction).toHaveBeenCalledWith(
        "response-action-1",
        expect.objectContaining({
          status: "SUCCESS",
          attempts: 1,
        }),
      );
    });

    it("should throw when the Discord response action does not exist", async () => {
      mockedFindAction.mockResolvedValue(null);

      await expect(
        markDiscordResponseSuccess(
          "interaction-1",
        ),
      ).rejects.toThrow(
        "Discord response action was not found.",
      );

      expect(
        mockedUpdateAction,
      ).not.toHaveBeenCalled();
    });
  });
});
