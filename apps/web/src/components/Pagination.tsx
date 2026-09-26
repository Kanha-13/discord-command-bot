interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold tabular-nums text-slate-300">{page}</span>
        <span className="text-[10px] text-slate-500">of {totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg className="h-3 w-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6.5 2L3.5 5l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Prev
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "…" ? (
                <span key={`ellipsis-${idx}`} className="w-6 text-center text-[10px] text-slate-600">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums transition-colors ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                      : "text-slate-500 hover:bg-white/8 hover:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
          <svg className="h-3 w-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3.5 2l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}