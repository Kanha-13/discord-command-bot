import type { CommandInteraction } from "../types/interaction";
import StatusBadge from "./StatusBadge";
import ActionSummary from "./ActionSummary";
import { formatRelativeTime } from "../utils/date";

interface InteractionTableProps {
  interactions: CommandInteraction[];
  loading: boolean;
}

export default function InteractionTable({
  interactions,
  loading,
}: InteractionTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/8 px-6 py-5">
        <h2 className="text-sm font-semibold tracking-tight text-white">Command Activity</h2>
        <p className="mt-0.5 text-xs text-slate-500">Recent slash-command activity</p>
      </div>

      {loading && interactions.length === 0 ? (
        <div className="flex items-center justify-center gap-2 px-6 py-14 text-xs text-slate-500">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-slate-400" />
          Loading activity…
        </div>
      ) : interactions.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-xs font-medium text-slate-500">No command activity found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-white/8">
                {["Command", "User", "Server", "Status", "Actions", "Time"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {interactions.map((interaction) => (
                <tr
                  key={interaction.id}
                  className="group transition-colors duration-100 hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className="rounded-md bg-white/8 px-2 py-0.5 font-mono text-xs font-medium text-slate-300 transition-colors duration-100 group-hover:bg-white/12">
                      /{interaction.commandName}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-400">
                    {interaction.userDiscordId}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-slate-300">
                    {interaction.server.name}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5">
                    <StatusBadge status={interaction.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5">
                    <ActionSummary actions={interaction.actions} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-xs tabular-nums text-slate-500">
                    {formatRelativeTime(interaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}