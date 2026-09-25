import type {
  InteractionStatus,
} from "../types/interaction";

interface StatusBadgeProps {
  status: InteractionStatus;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<
    InteractionStatus,
    string
  > = {
    RECEIVED:
      "bg-slate-100 text-slate-700",
    PROCESSING:
      "bg-amber-100 text-amber-700",
    COMPLETED:
      "bg-green-100 text-green-700",
    FAILED:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}