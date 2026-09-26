import { useState } from "react";
import type {
  InteractionAction,
  ActionAttempt,
} from "../types/interaction";

interface ActionSummaryProps {
  actions: InteractionAction[];
}

function getActionLabel(
  type: InteractionAction["type"],
) {
  switch (type) {
    case "DISCORD_RESPONSE":
      return "Discord Response";

    case "MIRROR_NOTIFICATION":
      return "Mirror Notification";

    default:
      return type;
  }
}

function AttemptHistory({
  attempts,
}: {
  attempts: ActionAttempt[];
}) {
  return (
    <div className="mt-2 space-y-1 border-l border-slate-200 pl-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="rounded-md bg-slate-50 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-600">
              Attempt {attempt.attempt}
            </span>

            <span
              className={
                attempt.status === "SUCCESS"
                  ? "text-xs font-medium text-green-600"
                  : attempt.status === "FAILED"
                    ? "text-xs font-medium text-red-600"
                    : "text-xs font-medium text-slate-500"
              }
            >
              {attempt.status}
            </span>
          </div>

          {attempt.error && (
            <p className="mt-1 text-xs text-red-500">
              {attempt.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ActionRow({
  action,
}: {
  action: InteractionAction;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasHistory = action.attemptsHistory.length > 0;

  return (
    <div className="border-t border-slate-100 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-700">
            {getActionLabel(action.type)}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {action.attempts}{" "}
            {action.attempts === 1 ? "attempt" : "attempts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={
              action.status === "SUCCESS"
                ? "text-xs font-medium text-green-600"
                : action.status === "FAILED"
                  ? "text-xs font-medium text-red-600"
                  : "text-xs font-medium text-slate-500"
            }
          >
            {action.status}
          </span>

          {hasHistory && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              {expanded ? "Hide" : "Details"}
            </button>
          )}
        </div>
      </div>

      {expanded && hasHistory && (
        <AttemptHistory
          attempts={action.attemptsHistory}
        />
      )}
    </div>
  );
}

export default function ActionSummary({
  actions,
}: ActionSummaryProps) {
  const successful = actions.filter(
    (action) => action.status === "SUCCESS",
  ).length;

  return (
    <div className="min-w-[220px] text-sm">
      <div>
        <span className="font-medium text-slate-700">
          {successful} / {actions.length}
        </span>

        <span className="ml-1 text-slate-400">
          successful
        </span>
      </div>

      <div>
        {actions.map((action) => (
          <ActionRow
            key={action.id}
            action={action}
          />
        ))}
      </div>
    </div>
  );
}