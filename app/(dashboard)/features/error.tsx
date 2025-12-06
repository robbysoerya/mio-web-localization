"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function FeaturesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Features page error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Features</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            {error.message || "Failed to load features. Please try again."}
          </p>
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
