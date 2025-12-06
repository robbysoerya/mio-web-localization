export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600 dark:text-green-400";
  if (percentage >= 70) return "text-blue-600 dark:text-blue-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export function getCompletionBgColor(percentage: number): string {
  if (percentage >= 90) return "bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-900";
  if (percentage >= 70) return "bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900";
  if (percentage >= 50) return "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900";
  return "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-900";
}

export function getCompletionBarColor(percentage: number): string {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
