import { MicroLearningSkeleton } from "./MicroLearningSkeleton";
import { NewsFeedSkeleton } from "./NewsFeedSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
      <MicroLearningSkeleton />
      <NewsFeedSkeleton />
    </div>
  );
}
