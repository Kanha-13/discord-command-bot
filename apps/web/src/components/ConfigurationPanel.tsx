import { useEffect, useState } from "react";
import SelectField from "./SelectField";
import { getServerChannels, getServerConfiguration, saveServerConfiguration } from "../services/server.service";
import type { CommandConfiguration, DiscordChannel, ServerConfiguration } from "../types/server";

interface ConfigurationPanelProps {
  serverId: string;
}

export default function ConfigurationPanel({ serverId }: ConfigurationPanelProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [configuration, setConfiguration] = useState<ServerConfiguration | null>(null);
  const [commandChannelId, setCommandChannelId] = useState("");
  const [mirrorChannelId, setMirrorChannelId] = useState("");
  const [commands, setCommands] = useState<CommandConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadConfiguration() {
      setLoading(true); setError(""); setSuccess("");
      try {
        const [serverChannels, serverConfig] = await Promise.all([
          getServerChannels(serverId),
          getServerConfiguration(serverId).catch(() => null),
        ]);
        if (cancelled) return;
        setChannels(serverChannels);
        setConfiguration(serverConfig);
        setCommandChannelId(serverConfig?.commandChannelId ?? "");
        setMirrorChannelId(serverConfig?.mirrorChannelId ?? "");
        setCommands(serverConfig?.commands ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load configuration.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadConfiguration();
    return () => { cancelled = true; };
  }, [serverId]);

  function updateCommandConfiguration(commandName: string, updates: Partial<CommandConfiguration>) {
    setCommands((curr) =>
      curr.map((cmd) => cmd.commandName === commandName ? { ...cmd, ...updates } : cmd),
    );
  }

  async function handleSave() {
    setError(""); setSuccess("");
    if (!commandChannelId || !mirrorChannelId) { setError("Please select both command and mirror channels."); return; }
    if (commandChannelId === mirrorChannelId) { setError("Command and mirror channels must be different."); return; }
    setSaving(true);
    try {
      const saved = await saveServerConfiguration(serverId, { commandChannelId, mirrorChannelId, commands });
      setConfiguration(saved);
      setSuccess("Configuration saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  const channelOptions = channels.map((ch) => ({ value: ch.id, label: `#${ch.name}` }));

  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/8 px-6 py-5">
          <div className="h-4 w-40 animate-pulse rounded-md bg-white/10" />
          <div className="mt-1.5 h-3 w-64 animate-pulse rounded-md bg-white/5" />
        </div>
        <div className="flex items-center justify-center gap-2 px-6 py-14 text-xs text-slate-500">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-slate-400" />
          Loading server configuration…
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

      {/* Header */}
      <div className="border-b border-white/8 px-6 py-5">
        <h2 className="text-sm font-semibold tracking-tight text-white">Server Configuration</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Choose where commands are accepted and where notifications are mirrored.
        </p>
      </div>

      <div className="divide-y divide-white/5">

        {/* Channel selectors */}
        <div className="px-6 py-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Channels</p>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Command Channel" value={commandChannelId} options={channelOptions} onChange={setCommandChannelId} />
            <SelectField label="Mirror Channel" value={mirrorChannelId} options={channelOptions} onChange={setMirrorChannelId} />
          </div>
        </div>

        {/* Command rules */}
        <div className="px-6 py-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Command Rules</p>
          <p className="mb-4 text-xs text-slate-500">Configure which commands are enabled and where they can be used.</p>

          <div className="space-y-2">
            {commands.map((command) => (
              <div
                key={command.commandName}
                className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                  command.enabled ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02]"
                }`}
              >
                {/* Command name */}
                <div className="w-28 shrink-0">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-medium ${
                    command.enabled ? "bg-white/10 text-slate-300" : "bg-white/5 text-slate-600"
                  }`}>
                    /{command.commandName}
                  </span>
                </div>

                {/* Toggle */}
                <label className="flex cursor-pointer items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={command.enabled}
                      onChange={(e) => updateCommandConfiguration(command.commandName, { enabled: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-4 w-7 rounded-full border border-white/10 bg-white/5 transition-colors peer-checked:border-indigo-500/50 peer-checked:bg-indigo-600" />
                    <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-slate-500 shadow-sm transition-all peer-checked:translate-x-3 peer-checked:bg-white" />
                  </div>
                  <span className={`text-xs font-medium ${command.enabled ? "text-slate-300" : "text-slate-600"}`}>
                    {command.enabled ? "Enabled" : "Disabled"}
                  </span>
                </label>

                {/* Channel select */}
                <select
                  value={command.channelId}
                  disabled={!command.enabled}
                  onChange={(e) => updateCommandConfiguration(command.commandName, { channelId: e.target.value })}
                  className="ml-auto min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-600"
                >
                  {channels
                    .filter((ch) => ch.id !== mirrorChannelId)
                    .map((ch) => (
                      <option key={ch.id} value={ch.id} className="bg-slate-900 text-white">
                        #{ch.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <svg className="mt-px h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 12 12" fill="none">
                <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <svg className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <p className="text-xs text-emerald-400">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${configuration ? "bg-emerald-400" : "bg-slate-600"}`} />
              <span className="text-[10px] text-slate-500">
                {configuration ? "Configuration is active" : "Not saved yet"}
              </span>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 6.5l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}