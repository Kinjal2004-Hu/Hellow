import { Skeleton } from "@/components/ui/skeleton";

export function NewsFeedSkeleton() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border p-3.5 shadow-sm"
          >
            <Skeleton className="aspect-[16/10] rounded-xl mb-3" />
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}
