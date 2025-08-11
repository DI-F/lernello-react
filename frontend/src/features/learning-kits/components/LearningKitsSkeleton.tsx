import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LearningKitsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="relative">
          <CardHeader className="space-y-0 pb-2">
            <div className="flex items-center gap-2 pr-10">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="absolute right-3 top-3 h-8 w-8 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
