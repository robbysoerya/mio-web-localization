"use client";

import { useState, useEffect } from "react";
import { FocusSetup } from "@/components/focus/FocusSetup";
import { FocusSession } from "@/components/focus/FocusSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
// useRouter removed

export default function FocusPage() {
  const [mode, setMode] = useState<"setup" | "session" | "complete">("setup");
  const [queue, setQueue] = useState<Array<{ keyId: string; keyName: string; featureName: string; locale: string }>>([]);
  const { selectedProjectId } = useProject();
  
  // Redirect to dashboard if no project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      window.location.href = "/dashboard";
    }
  }, [selectedProjectId]);

  const handleStart = (newQueue: typeof queue) => {
    setQueue(newQueue);
    setMode("session");
  };

  const handleComplete = () => {
    setMode("complete");
  };

  const handleExit = () => {
    setMode("setup");
    setQueue([]);
  };

  if (mode === "session") {
    return (
      <FocusSession 
        queue={queue} 
        onComplete={handleComplete} 
        onExit={handleExit} 
      />
    );
  }

  if (mode === "complete") {
    return (
      <div className="max-w-md mx-auto mt-10 text-center space-y-6">
        <Card className="p-8">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-8">
            You&apos;ve successfully translated {queue.length} keys. Great job!
          </p>
          <Button onClick={handleExit} size="lg" className="w-full">
            Start Another Session <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return <FocusSetup onStart={handleStart} />;
}
