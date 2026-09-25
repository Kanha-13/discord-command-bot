import type {
  CommandInteraction,
} from "../types/interaction";
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
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Command Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Recent slash-command activity.
        </p>
      </div>

      {loading && interactions.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          Loading activity...
        </div>
      ) : interactions.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          No command activity found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Command
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Server
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Actions
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Time
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {interactions.map((interaction) => (
                <tr
                  key={interaction.id}
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-mono text-sm font-medium text-slate-900">
                      /{interaction.commandName}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {interaction.userDiscordId}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {interaction.server.name}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge
                      status={interaction.status}
                    />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <ActionSummary
                      actions={interaction.actions}
                    />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {formatRelativeTime(
                      interaction.createdAt,
                    )}
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