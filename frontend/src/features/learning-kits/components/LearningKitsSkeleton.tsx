import { Skeleton } from "@/components/ui/skeleton";

export function LearningKitsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
