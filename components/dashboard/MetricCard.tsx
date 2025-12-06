import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: "border-border bg-card",
  success: "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20",
  warning: "border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20",
  danger: "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20",
  info: "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20",
};

const variantTextStyles = {
  default: "text-foreground",
  success: "text-green-700 dark:text-green-400",
  warning: "text-yellow-700 dark:text-yellow-400",
  danger: "text-red-700 dark:text-red-400",
  info: "text-blue-700 dark:text-blue-400",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-6 border-2 transition-shadow hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p
            className={cn(
              "text-3xl font-bold mb-1",
              variantTextStyles[variant]
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg", variantTextStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
