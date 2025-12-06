import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: Error | string | null;
  title?: string;
}

export function ErrorAlert({ error, title = "Error" }: ErrorAlertProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
