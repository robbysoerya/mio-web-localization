"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function KeysError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Keys page error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Keys</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            {error.message || "Failed to load keys. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" size="sm">
              Try Again
            </Button>
            <Link href="/features">
              <Button variant="outline" size="sm">
                Back to Features
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
