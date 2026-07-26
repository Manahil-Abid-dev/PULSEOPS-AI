import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4 pt-4 flex-wrap">
      <p className="text-xs text-muted">
        Showing <span className="text-foreground/80 font-medium">{start}-{end}</span> of{" "}
        <span className="text-foreground/80 font-medium">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-muted hover:bg-white/5 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="px-1 text-muted text-xs">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 min-w-8 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                  p === page
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/25"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-muted hover:bg-white/5 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
