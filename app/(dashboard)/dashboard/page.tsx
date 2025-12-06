"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStatistics } from "@/lib/endpoints/statistics";
import { fetchFeatures } from "@/lib/endpoints/features";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CompletionChart } from "@/components/dashboard/CompletionChart";
import { MissingTranslationsTable } from "@/components/dashboard/MissingTranslationsTable";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { HealthIndicators } from "@/components/dashboard/HealthIndicators";
import {
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  Layers,
} from "lucide-react";
import { formatPercentage, formatNumber } from "@/lib/utils/format";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [selectedFeatureId, setSelectedFeatureId] = useState<
    string | undefined
  >(undefined);

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["statistics", selectedFeatureId],
    queryFn: () => fetchStatistics(selectedFeatureId),
  });

  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor translation progress, quality, and system health
          </p>
        </div>
        {features && features.length > 0 && (
          <div className="w-64">
            <Select
              value={selectedFeatureId || "all"}
              onValueChange={(value) =>
                setSelectedFeatureId(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by feature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Features</SelectItem>
                {features.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    {feature.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Overview Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Overview
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Overall Completion"
            value={formatPercentage(statistics.overallCompletionPercentage)}
            subtitle="Across all locales and keys"
            icon={TrendingUp}
            variant={
              statistics.overallCompletionPercentage >= 90
                ? "success"
                : statistics.overallCompletionPercentage >= 70
                ? "info"
                : statistics.overallCompletionPercentage >= 50
                ? "warning"
                : "danger"
            }
          />
          <MetricCard
            title="Total Translations"
            value={formatNumber(statistics.totalTranslations)}
            subtitle="Translation records"
            icon={FileText}
            variant="default"
          />
          <MetricCard
            title="Empty Values"
            value={formatNumber(statistics.emptyValueCount)}
            subtitle="Translations with empty strings"
            icon={AlertCircle}
            variant={statistics.emptyValueCount > 0 ? "warning" : "success"}
          />
          <MetricCard
            title="Missing Translations"
            value={formatNumber(statistics.missingTranslations.length)}
            subtitle="Keys with incomplete locales"
            icon={Layers}
            variant={
              statistics.missingTranslations.length > 0 ? "danger" : "success"
            }
          />
        </div>
      </div>

      {/* Completion Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📊 Completion Metrics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompletionChart
            data={statistics.completionByLocale}
            title="Completion by Locale"
            type="locale"
          />
          <CompletionChart
            data={statistics.completionByFeature}
            title="Completion by Feature"
            type="feature"
          />
        </div>
      </div>

      {/* Quality Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🔍 Quality Metrics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentActivityFeed data={statistics.recentlyUpdated} />
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Most Active Features</h3>
            {statistics.mostActiveFeatures.length > 0 ? (
              <div className="space-y-3">
                {statistics.mostActiveFeatures.map((feature, index) => (
                  <div
                    key={feature.featureId}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{feature.featureName}</span>
                    </div>
                    <Badge variant="secondary">
                      {formatNumber(feature.translationCount)} translations
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active features
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Missing Translations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📋 Missing Translations</h2>
        <MissingTranslationsTable data={statistics.missingTranslations} />
      </div>

      {/* Health Indicators */}
      <div>
        <h2 className="text-xl font-semibold mb-4">⚠️ Health Indicators</h2>
        <HealthIndicators
          orphanedKeysCount={statistics.orphanedKeysCount}
          duplicateKeys={statistics.duplicateKeys}
          activeFeaturesWithMissingTranslations={
            statistics.activeFeaturesWithMissingTranslations
          }
        />
      </div>
    </div>
  );
}
