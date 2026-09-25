import type {
  InteractionAction,
} from "../types/interaction";

interface ActionSummaryProps {
  actions: InteractionAction[];
}

export default function ActionSummary({
  actions,
}: ActionSummaryProps) {
  const successful = actions.filter(
    (action) => action.status === "SUCCESS",
  ).length;

  return (
    <div className="text-sm">
      <span className="font-medium text-slate-700">
        {successful} / {actions.length}
      </span>

      <span className="ml-1 text-slate-400">
        successful
      </span>
    </div>
  );
}