import { useEffect, useState } from "react";
import SelectField from "./SelectField";
import {
  getServerChannels,
  getServerConfiguration,
  saveServerConfiguration,
} from "../services/server.service";
import type {
  CommandConfiguration,
  DiscordChannel,
  ServerConfiguration,
} from "../types/server";

interface ConfigurationPanelProps {
  serverId: string;
}

export default function ConfigurationPanel({
  serverId,
}: ConfigurationPanelProps) {
  const [channels, setChannels] = useState<
    DiscordChannel[]
  >([]);

  const [configuration, setConfiguration] =
    useState<ServerConfiguration | null>(null);

  const [commandChannelId, setCommandChannelId] =
    useState("");

  const [mirrorChannelId, setMirrorChannelId] =
    useState("");

  const [commands, setCommands] = useState<
    CommandConfiguration[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadConfiguration() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const [serverChannels, serverConfig] =
          await Promise.all([
            getServerChannels(serverId),
            getServerConfiguration(serverId).catch(
              () => null,
            ),
          ]);

        if (cancelled) {
          return;
        }

        setChannels(serverChannels);
        setConfiguration(serverConfig);

        setCommandChannelId(
          serverConfig?.commandChannelId ?? "",
        );

        setMirrorChannelId(
          serverConfig?.mirrorChannelId ?? "",
        );

        setCommands(serverConfig?.commands ?? []);

      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load configuration.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfiguration();

    return () => {
      cancelled = true;
    };
  }, [serverId]);

  function updateCommandConfiguration(
    commandName: string,
    updates: Partial<CommandConfiguration>,
  ) {
    setCommands((currentCommands) =>
      currentCommands.map((command) =>
        command.commandName === commandName
          ? {
            ...command,
            ...updates,
          }
          : command,
      ),
    );
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!commandChannelId || !mirrorChannelId) {
      setError(
        "Please select both command and mirror channels.",
      );
      return;
    }

    if (commandChannelId === mirrorChannelId) {
      setError(
        "Command and mirror channels must be different.",
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await saveServerConfiguration(
        serverId,
        {
          commandChannelId,
          mirrorChannelId,
          commands
        },
      );

      setConfiguration(saved);
      setSuccess("Configuration saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save configuration.",
      );
    } finally {
      setSaving(false);
    }
  }

  const channelOptions = channels.map((channel) => ({
    value: channel.id,
    label: `#${channel.name}`,
  }));

  if (loading) {
    return (
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading server configuration...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Server Configuration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose where commands are accepted and where
          notifications are mirrored.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <SelectField
          label="Command Channel"
          value={commandChannelId}
          options={channelOptions}
          onChange={setCommandChannelId}
        />

        <SelectField
          label="Mirror Channel"
          value={mirrorChannelId}
          options={channelOptions}
          onChange={setMirrorChannelId}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">
            Command Rules
          </h3>

          <p className="text-sm text-gray-500">
            Configure which commands are enabled and
            where they can be used.
          </p>
        </div>

        <div className="space-y-3">
          {commands.map((command) => (
            <div
              key={command.commandName}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="min-w-24">
                <span className="font-medium">
                  /{command.commandName}
                </span>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={command.enabled}
                  onChange={(event) =>
                    updateCommandConfiguration(
                      command.commandName,
                      {
                        enabled:
                          event.target.checked,
                      },
                    )
                  }
                />

                <span className="text-sm">
                  Enabled
                </span>
              </label>

              <select
                value={command.channelId}
                disabled={!command.enabled}
                onChange={(event) =>
                  updateCommandConfiguration(
                    command.commandName,
                    {
                      channelId:
                        event.target.value,
                    },
                  )
                }
                className="flex-1 rounded-md border px-3 py-2"
              >
                {channels
                  .filter(
                    (channel) =>
                      channel.id !== mirrorChannelId,
                  )
                  .map((channel) => (
                    <option
                      key={channel.id}
                      value={channel.id}
                    >
                      #{channel.name}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {configuration
            ? "Configuration is active."
            : "Configuration has not been saved yet."}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </section>
  );
}