import { useState } from "react";
import type { InteractionAction, ActionAttempt } from "../types/interaction";

interface ActionSummaryProps {
  actions: InteractionAction[];
}

function getActionLabel(type: InteractionAction["type"]) {
  switch (type) {
    case "DISCORD_RESPONSE": return "Discord Response";
    case "MIRROR_NOTIFICATION": return "Mirror Notification";
    default: return type;
  }
}

const statusMeta = (status: string) => {
  switch (status) {
    case "SUCCESS": return { text: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400", border: "border-emerald-500/20" };
    case "FAILED": return { text: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400", border: "border-red-500/20" };
    default: return { text: "text-slate-400", bg: "bg-white/5", dot: "bg-slate-500", border: "border-white/10" };
  }
};

function AttemptHistory({ attempts }: { attempts: ActionAttempt[] }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-white/8 bg-slate-900/60">
      {/* Header */}
      <div className="grid grid-cols-[1.5rem_1fr_auto] gap-3 border-b border-white/5 bg-white/5 px-3 py-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">#</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">Status</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-600">Error</span>
      </div>

      <div className="divide-y divide-white/5">
        {attempts.map((attempt) => {
          const s = statusMeta(attempt.status);
          return (
            <div key={attempt.id} className="px-3 py-2">
              <div className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                {/* Number */}
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/8 text-[9px] font-bold text-slate-500">
                  {attempt.attempt}
                </span>

                {/* Status pill */}
                <div className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 ${s.bg} ${s.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-[10px] font-semibold ${s.text}`}>{attempt.status}</span>
                </div>

                {/* Error — spans full width below if present */}
                {attempt.error ? (
                  <span className="text-[10px] text-slate-600">—</span>
                ) : (
                  <span className="text-[10px] text-slate-600">—</span>
                )}
              </div>

              {attempt.error && (
                <div className="mt-1.5 flex items-start gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5">
                  <svg className="mt-px h-3 w-3 shrink-0 text-red-400" viewBox="0 0 12 12" fill="none">
                    <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <p className="text-[10px] leading-relaxed text-red-400">{attempt.error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: InteractionAction }) {
  const [expanded, setExpanded] = useState(false);
  const hasHistory = action.attemptsHistory.length > 0;
  const s = statusMeta(action.status);

  return (
    <div className="border-t border-white/5 py-2 first:border-t-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-300">
            {getActionLabel(action.type)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {action.attempts} {action.attempts === 1 ? "attempt" : "attempts"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${s.bg} ${s.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className={`text-[10px] font-semibold ${s.text}`}>{action.status}</span>
          </div>

          {/* Always reserve the same width whether or not the button is shown */}
          <div className="w-13">
            {hasHistory && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`flex w-full items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${expanded ? "bg-white/10 text-slate-300" : "text-slate-500 hover:bg-white/8 hover:text-slate-300"
                  }`}
              >
                {expanded ? "Hide" : "Details"}
                <svg
                  className={`ml-auto h-2.5 w-2.5 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
                  viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
                >
                  <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && hasHistory && (
        <AttemptHistory attempts={action.attemptsHistory} />
      )}
    </div>
  );
}

export default function ActionSummary({ actions }: ActionSummaryProps) {
  const successful = actions.filter((a) => a.status === "SUCCESS").length;

  return (
    <div className="min-w-[200px]">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold tabular-nums text-slate-300">
          {successful}/{actions.length}
        </span>
        <span className="text-[10px] text-slate-500">successful</span>
      </div>
      <div className="mt-0.5">
        {actions.map((action) => (
          <ActionRow key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}