"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiTranslateSingleKey } from "@/lib/endpoints/ai-translations";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

interface AITranslateButtonProps {
  keyId: string;
  missingLocales: string[];
}

export function AITranslateButton({ keyId, missingLocales }: AITranslateButtonProps) {
  const [error, setError] = useState<Error | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: aiTranslateSingleKey,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["translations", keyId] });
      setError(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err);
    },
  });

  const handleTranslate = () => {
    setError(null);
    mutation.mutate({
      keyId,
      targetLocales: missingLocales,
    });
  };

  // Don't show button if no missing locales
  if (missingLocales.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTranslate}
          disabled={mutation.isPending}
          className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100 dark:from-purple-900 dark:to-violet-900 dark:border-purple-700 dark:hover:from-purple-800 dark:hover:to-violet-800"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-300" />
          )}
          {mutation.isPending
            ? "Translating..."
            : showSuccess
            ? "✓ Translated!"
            : `AI Translate (${missingLocales.length} missing)`}
        </Button>
      </div>
      <ErrorAlert error={error} />
    </div>
  );
}
