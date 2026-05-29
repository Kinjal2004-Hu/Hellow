import { Skeleton } from "@/components/ui/skeleton";

export function MicroLearningSkeleton() {
  return (
    <section className="xl:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">
        <Skeleton className="md:w-[40%] aspect-[4/3] md:aspect-auto md:min-h-[240px] rounded-none" />
        <div className="flex-1 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
