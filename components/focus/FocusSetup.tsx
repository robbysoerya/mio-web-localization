"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeatures } from "@/lib/endpoints/features";
import { fetchLanguages } from "@/lib/endpoints/languages";
import { fetchStatistics } from "@/lib/endpoints/statistics";
import { useProject } from "@/contexts/ProjectContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Zap, Target } from "lucide-react";

interface FocusSetupProps {
  onStart: (queue: Array<{ keyId: string; keyName: string; featureName: string; locale: string }>) => void;
}

export function FocusSetup({ onStart }: FocusSetupProps) {
  const [selectedLocale, setSelectedLocale] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedProjectId } = useProject();

  const { data: features } = useQuery({
    queryKey: ["features", selectedProjectId],
    queryFn: () => fetchFeatures(selectedProjectId),
  });

  const { data: languages } = useQuery({
    queryKey: ["languages", selectedProjectId],
    queryFn: () => fetchLanguages(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: statistics, isLoading: isLoadingStats } = useQuery({
    queryKey: ["statistics", selectedFeature === "all" ? undefined : selectedFeature, selectedProjectId],
    queryFn: () => fetchStatistics(selectedFeature === "all" ? undefined : selectedFeature, selectedProjectId),
  });

  const handleStart = () => {
    if (!statistics || !selectedLocale) return;

    setIsGenerating(true);

    // Filter missing translations that need the selected locale
    const queue = statistics.missingTranslations
      .filter((item) => item.missingLocales.includes(selectedLocale))
      .map((item) => ({
        keyId: item.keyId,
        keyName: item.keyName,
        featureName: item.featureName,
        locale: selectedLocale,
      }));

    // Simulate a small delay for better UX
    setTimeout(() => {
      setIsGenerating(false);
      onStart(queue);
    }, 500);
  };

  const activeLanguages = languages?.filter((l) => l.isActive) || [];
  const availableTasksCount = statistics?.missingTranslations.filter((item) => 
    selectedLocale ? item.missingLocales.includes(selectedLocale) : true
  ).length || 0;

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="text-center mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Focus Mode</h1>
        <p className="text-muted-foreground mt-2">
          Rapidly translate missing keys one by one without distractions.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Target Language</Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger>
              <SelectValue placeholder="Select language to translate..." />
            </SelectTrigger>
            <SelectContent>
              {activeLanguages.map((lang) => (
                <SelectItem key={lang.id} value={lang.locale}>
                  {lang.name} ({lang.locale})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Feature (Optional)</Label>
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger>
              <SelectValue placeholder="All Features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              {features?.map((feature) => (
                <SelectItem key={feature.id} value={feature.id}>
                  {feature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Available Tasks</p>
            <p className="text-3xl font-bold">
              {isLoadingStats ? "-" : availableTasksCount}
            </p>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleStart}
            disabled={!selectedLocale || availableTasksCount === 0 || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Target className="mr-2 h-4 w-4" />
            )}
            Start Session
          </Button>
        </div>
      </Card>
    </div>
  );
}
