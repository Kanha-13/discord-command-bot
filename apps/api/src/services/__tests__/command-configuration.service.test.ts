import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  findCommandConfiguration,
  findCommandConfigurationsByServerId,
  upsertCommandConfiguration,
} from "../../repositories/command-configuration.repository";

import {
  getRegisteredCommands,
} from "../../commands/command.registry";

import {
  getCommandConfigurations,
  getCommandConfiguration,
  saveCommandConfiguration,
} from ".././command-configuration.service";

vi.mock(
  "../../repositories/command-configuration.repository",
  () => ({
    findCommandConfiguration: vi.fn(),
    findCommandConfigurationsByServerId: vi.fn(),
    upsertCommandConfiguration: vi.fn(),
  }),
);

vi.mock(
  "../../commands/command.registry",
  () => ({
    getRegisteredCommands: vi.fn(),
  }),
);

const mockedFindCommandConfiguration =
  vi.mocked(findCommandConfiguration);

const mockedFindCommandConfigurationsByServerId =
  vi.mocked(findCommandConfigurationsByServerId);

const mockedUpsertCommandConfiguration =
  vi.mocked(upsertCommandConfiguration);

const mockedGetRegisteredCommands =
  vi.mocked(getRegisteredCommands);

describe(
  "command-configuration.service",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe(
      "getCommandConfigurations",
      () => {
        it(
          "returns command configurations for a server",
          async () => {
            const configurations = [
              {
                id: "config-1",
                serverId: "server-1",
                commandName: "status",
                enabled: true,
                channelId: "channel-1",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];

            mockedFindCommandConfigurationsByServerId.mockResolvedValue(
              configurations,
            );

            const result =
              await getCommandConfigurations(
                "server-1",
              );

            expect(result).toEqual(
              configurations,
            );

            expect(
              mockedFindCommandConfigurationsByServerId,
            ).toHaveBeenCalledWith(
              "server-1",
            );
          },
        );
      },
    );

    describe(
      "getCommandConfiguration",
      () => {
        it(
          "returns configuration for a command",
          async () => {
            const configuration = {
              id: "config-1",
              serverId: "server-1",
              commandName: "report",
              enabled: true,
              channelId: "channel-2",
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockedFindCommandConfiguration.mockResolvedValue(
              configuration,
            );

            const result =
              await getCommandConfiguration(
                "server-1",
                "report",
              );

            expect(result).toEqual(
              configuration,
            );

            expect(
              mockedFindCommandConfiguration,
            ).toHaveBeenCalledWith(
              "server-1",
              "report",
            );
          },
        );

        it(
          "returns null when command has no configuration",
          async () => {
            mockedFindCommandConfiguration.mockResolvedValue(
              null,
            );

            const result =
              await getCommandConfiguration(
                "server-1",
                "report",
              );

            expect(result).toBeNull();
          },
        );
      },
    );

    describe(
      "saveCommandConfiguration",
      () => {
        it(
          "saves configuration for a registered command",
          async () => {
            mockedGetRegisteredCommands.mockReturnValue([
              {
                name: "status",
                execute: vi.fn(),
              },
              {
                name: "report",
                execute: vi.fn(),
              },
            ]);

            const savedConfiguration = {
              id: "config-1",
              serverId: "server-1",
              commandName: "report",
              enabled: true,
              channelId: "channel-2",
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockedUpsertCommandConfiguration.mockResolvedValue(
              savedConfiguration,
            );

            const data = {
              serverId: "server-1",
              commandName: "report",
              enabled: true,
              channelId: "channel-2",
            };

            const result =
              await saveCommandConfiguration(
                data,
              );

            expect(result).toEqual(
              savedConfiguration,
            );

            expect(
              mockedUpsertCommandConfiguration,
            ).toHaveBeenCalledWith(data);
          },
        );

        it(
          "saves a disabled command configuration",
          async () => {
            mockedGetRegisteredCommands.mockReturnValue([
              {
                name: "status",
                execute: vi.fn(),
              },
            ]);

            const data = {
              serverId: "server-1",
              commandName: "status",
              enabled: false,
              channelId: "channel-1",
            };

            const savedConfiguration = {
              id: "config-1",
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockedUpsertCommandConfiguration.mockResolvedValue(
              savedConfiguration,
            );

            const result =
              await saveCommandConfiguration(
                data,
              );

            expect(result).toEqual(
              savedConfiguration,
            );

            expect(
              mockedUpsertCommandConfiguration,
            ).toHaveBeenCalledWith(data);
          },
        );

        it(
          "rejects an unregistered command",
          async () => {
            mockedGetRegisteredCommands.mockReturnValue([
              {
                name: "status",
                execute: vi.fn(),
              },
              {
                name: "report",
                execute: vi.fn(),
              },
            ]);

            const data = {
              serverId: "server-1",
              commandName: "unknown",
              enabled: true,
              channelId: "channel-1",
            };

            await expect(
              saveCommandConfiguration(data),
            ).rejects.toThrow(
              "Unsupported command: unknown",
            );

            expect(
              mockedUpsertCommandConfiguration,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );
  },
);