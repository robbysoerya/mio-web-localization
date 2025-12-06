import { CompletionByLocale, CompletionByFeature } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  formatPercentage,
  getCompletionBarColor,
  getCompletionColor,
} from "@/lib/utils/format";

interface CompletionChartProps {
  data: CompletionByLocale[] | CompletionByFeature[];
  title: string;
  type: "locale" | "feature";
}

export function CompletionChart({ data, title, type }: CompletionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-muted-foreground">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const label =
            type === "locale"
              ? (item as CompletionByLocale).locale
              : (item as CompletionByFeature).featureName;
          const percentage = item.percentage;
          const filled = item.filled;
          const total = item.total;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={getCompletionColor(percentage)}>
                  {formatPercentage(percentage)}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all ${getCompletionBarColor(
                    percentage
                  )}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filled} / {total} translations
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
