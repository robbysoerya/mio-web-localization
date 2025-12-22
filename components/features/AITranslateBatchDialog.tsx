"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiTranslateBatch, AITranslateBatchResponse } from "@/lib/endpoints/ai-translations";
import { fetchLanguages } from "@/lib/endpoints/languages";
import { useProject } from "@/contexts/ProjectContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Language } from "@/lib/types";

interface AITranslateBatchDialogProps {
  featureId: string;
  featureName: string;
  totalKeys?: number;
}

export function AITranslateBatchDialog({
  featureId,
  featureName,
  totalKeys = 0,
}: AITranslateBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [translateAll, setTranslateAll] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<AITranslateBatchResponse | null>(null);
  const qc = useQueryClient();
  const { selectedProjectId } = useProject();

  // Fetch available languages
  const { data: languages } = useQuery({
    queryKey: ["languages", selectedProjectId],
    queryFn: () => fetchLanguages(selectedProjectId),
    enabled: !!selectedProjectId && open,
  });

  const activeLanguages = languages?.filter((lang: Language) => lang.isActive) || [];

  const mutation = useMutation({
    mutationFn: aiTranslateBatch,
    onSuccess: (data: AITranslateBatchResponse) => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["translations"] });
      setError(null);
      setSuccessData(data);
      setShowSuccess(true);
    },
    onError: (err: Error) => {
      setError(err);
    },
  });

  const handleTranslate = () => {
    setError(null);
    setShowSuccess(false);
    mutation.mutate({
      featureId,
      targetLocales: translateAll ? undefined : selectedLocales,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setShowSuccess(false);
    setError(null);
    setTranslateAll(true);
    setSelectedLocales([]);
  };

  const toggleLocale = (locale: string) => {
    setSelectedLocales((prev) =>
      prev.includes(locale)
        ? prev.filter((l) => l !== locale)
        : [...prev, locale]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/50"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Translate Missing Translations
          </DialogTitle>
          <DialogDescription>
            Automatically translate missing translations for{" "}
            <span className="font-semibold">{featureName}</span>.
            Existing translations will not be overwritten.
          </DialogDescription>
        </DialogHeader>

        {!showSuccess ? (
          <div className="space-y-4 py-4">
            <ErrorAlert error={error} />

            {/* Statistics */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Keys</span>
                <Badge variant="secondary">{totalKeys}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Languages
                </span>
                <Badge variant="secondary">{activeLanguages.length}</Badge>
              </div>
            </div>

            {/* Locale Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="translate-all"
                  checked={translateAll}
                  onCheckedChange={(checked) => setTranslateAll(!!checked)}
                />
                <Label htmlFor="translate-all" className="font-medium">
                  Translate all missing translations for active languages
                </Label>
              </div>

              {!translateAll && (
                <div className="ml-6 space-y-2 max-h-[200px] overflow-y-auto">
                  {activeLanguages.map((lang: Language) => (
                    <div key={lang.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`locale-${lang.locale}`}
                        checked={selectedLocales.includes(lang.locale)}
                        onCheckedChange={() => toggleLocale(lang.locale)}
                      />
                      <Label
                        htmlFor={`locale-${lang.locale}`}
                        className="text-sm font-normal"
                      >
                        <span className="font-mono">{lang.locale}</span> - {lang.name} (missing only)
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress */}
            {mutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Translating...</span>
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Translation Complete!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully processed all translations
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-900 dark:text-green-100">Translated</span>
                <Badge className="bg-green-600">
                  {successData?.translatedCount || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-900 dark:text-green-100">Skipped</span>
                <Badge variant="secondary">{successData?.skippedCount || 0}</Badge>
              </div>
              {successData?.statistics && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-900 dark:text-green-100">Keys Processed</span>
                  <Badge variant="secondary">
                    {successData.statistics.processedKeys} /{" "}
                    {successData.statistics.totalKeys}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {!showSuccess ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTranslate}
                disabled={
                  mutation.isPending ||
                  (!translateAll && selectedLocales.length === 0)
                }
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mutation.isPending ? "Translating..." : "Start Translation"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
