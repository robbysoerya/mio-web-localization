"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTranslations, createTranslation } from "@/lib/endpoints/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, SkipForward, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSessionProps {
  queue: Array<{ keyId: string; keyName: string; featureName: string; locale: string }>;
  onComplete: () => void;
  onExit: () => void;
}

export function FocusSession({ queue, onComplete, onExit }: FocusSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState("");
  const [streak, setStreak] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const qc = useQueryClient();

  const currentTask = queue[currentIndex];
  const progress = ((currentIndex) / queue.length) * 100;

  // Fetch context (existing translations for this key)
  const { data: contextTranslations, isLoading: isLoadingContext } = useQuery({
    queryKey: ["translations", currentTask?.keyId],
    queryFn: () => fetchTranslations(currentTask.keyId),
    enabled: !!currentTask,
  });

  // Auto-focus input when task changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const mutation = useMutation({
    mutationFn: createTranslation,
    onSuccess: () => {
      setStreak((s) => s + 1);
      handleNext();
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
  });

  const handleNext = () => {
    setValue("");
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    mutation.mutate({
      keyId: currentTask.keyId,
      locale: currentTask.locale,
      value: value,
    });
  };

  const handleSkip = () => {
    setIsSkipping(true);
    setStreak(0);
    setTimeout(() => {
      handleNext();
      setIsSkipping(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!currentTask) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header / Progress */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" onClick={onExit} className="text-muted-foreground">
            Exit
          </Button>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{currentIndex} / {queue.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 2 && (
            <div className="flex items-center gap-1 text-orange-500 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold">{streak} streak!</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <Card className={cn("p-4 md:p-8 transition-all duration-300", isSkipping ? "opacity-50 scale-95" : "opacity-100 scale-100")}>
        <div className="space-y-6">
          {/* Context Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{currentTask.featureName}</Badge>
              <span>•</span>
              <span className="font-mono">{currentTask.keyName}</span>
            </div>
            <h2 className="text-2xl font-bold">
              Translate to <span className="text-primary">{currentTask.locale}</span>
            </h2>
          </div>

          {/* Context Translations (e.g. English) */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context</h3>
            {isLoadingContext ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-2">
                {contextTranslations?.map((t) => (
                  <div key={t.id} className="grid grid-cols-[50px_1fr] gap-4 text-sm">
                    <span className="font-medium text-muted-foreground">{t.locale}</span>
                    <span>{t.value}</span>
                  </div>
                ))}
                {(!contextTranslations || contextTranslations.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No existing translations for context.</p>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <Textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Type ${currentTask.locale} translation...`}
              className="min-h-[100px] text-lg resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted border font-mono">Enter</kbd> to save
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip <SkipForward className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSubmit} disabled={!value.trim() || mutation.isPending}>
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Save & Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
