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
  default: "border-gray-200 bg-white",
  success: "border-green-200 bg-green-50",
  warning: "border-yellow-200 bg-yellow-50",
  danger: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
};

const variantTextStyles = {
  default: "text-gray-900",
  success: "text-green-700",
  warning: "text-yellow-700",
  danger: "text-red-700",
  info: "text-blue-700",
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
