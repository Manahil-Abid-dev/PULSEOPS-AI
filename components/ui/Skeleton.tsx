import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartCardSkeleton({ heightClass = "h-72" }: { heightClass?: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className={cn("w-full", heightClass)} />
    </div>
  );
}

export function ListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
