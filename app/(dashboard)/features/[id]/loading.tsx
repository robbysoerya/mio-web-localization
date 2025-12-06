import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function KeysLoading() {
  return (
    <div>
      <Skeleton className="h-6 w-64 mb-4" />
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-10 w-full max-w-md mb-6" />
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-2/3" />
          </Card>
        ))}
      </div>
    </div>
  );
}
