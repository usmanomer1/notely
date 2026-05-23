import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer bg-zinc-100/80", className)}
      aria-hidden
    />
  );
}

type NoteListSkeletonProps = {
  variant?: "rows" | "cards";
};

export function NoteListSkeleton({ variant = "rows" }: NoteListSkeletonProps) {
  if (variant === "cards") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2 border border-stone-200 p-3">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="py-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-1.5 px-3 py-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}
