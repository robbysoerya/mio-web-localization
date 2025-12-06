import { RecentlyUpdatedTranslation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { Clock } from "lucide-react";

interface RecentActivityFeedProps {
  data: RecentlyUpdatedTranslation[];
}

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </h3>
        <p className="text-sm text-muted-foreground">No recent updates</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Recent Activity
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.map((item, index) => (
          <div
            key={`${item.keyId}-${item.locale}-${index}`}
            className="pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.keyName}</p>
                <Badge variant="outline" className="mt-1">
                  {item.locale}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(item.updatedAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.value || <em className="text-red-500">(empty)</em>}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
