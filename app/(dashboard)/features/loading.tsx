import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function FeaturesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-10 w-full max-w-md mb-6" />
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    </div>
  );
}
