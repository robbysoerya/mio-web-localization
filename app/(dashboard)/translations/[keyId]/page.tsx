"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTranslations,
  bulkUpsertTranslations,
} from "@/lib/endpoints/translations";
import { fetchKey } from "@/lib/endpoints/keys";
import { fetchLanguages } from "@/lib/endpoints/languages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { DeleteTranslationDialog } from "@/components/translations/dialogs";
import { useProject } from "@/contexts/ProjectContext";
import { Language } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";

export default function TranslationEditor() {
  const params = useParams();
  const keyId = params.keyId as string;
  const qc = useQueryClient();
  const { selectedProjectId } = useProject();
  
  const [filter, setFilter] = useState<"all" | "empty" | "filled">("all");
  
  // Local state for translations (including unsaved changes)
  const [localTranslations, setLocalTranslations] = useState<Record<string, string>>({});
  const [dirtyLocales, setDirtyLocales] = useState<Set<string>>(new Set());
  const [initialTranslations, setInitialTranslations] = useState<Record<string, string>>({});
  const [error, setError] = useState<Error | null>(null);

  // Fetch key data
  const { data: keyData } = useQuery({
    queryKey: ["key", keyId],
    queryFn: () => fetchKey(keyId),
    enabled: !!keyId,
    retry: false,
    throwOnError: false,
  });

  // Fetch existing translations
  const { data: existingTranslations, isLoading: translationsLoading } = useQuery({
    queryKey: ["translations", keyId],
    queryFn: () => fetchTranslations(keyId),
    enabled: !!keyId,
  });

  // Fetch active languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["languages", selectedProjectId],
    queryFn: () => fetchLanguages(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Create initial translation map from existing data
  const initialTranslationMap = useMemo(() => {
    if (!existingTranslations) return {};
    const map: Record<string, string> = {};
    existingTranslations.forEach((t) => {
      map[t.locale] = t.value || "";
    });
    return map;
  }, [existingTranslations]);

  // Initialize local translations if empty
  if (Object.keys(localTranslations).length === 0 && Object.keys(initialTranslationMap).length > 0) {
    setLocalTranslations(initialTranslationMap);
    setInitialTranslations(initialTranslationMap);
  }

  // Merge existing translations with all active languages
  const allLocaleData = useMemo(() => {
    if (!languages) return [];
    
    const activeLanguages = languages.filter((lang) => lang.isActive);
    const existingMap = new Map(existingTranslations?.map((t) => [t.locale, t]) || []);
    
    return activeLanguages.map((lang) => {
      const existing = existingMap.get(lang.locale);
      return {
        locale: lang.locale,
        languageName: lang.name,
        translationId: existing?.id,
        value: localTranslations[lang.locale] || "",
        exists: !!existing,
      };
    });
  }, [languages, existingTranslations, localTranslations]);

  // Bulk save mutation
  const bulkSaveMutation = useMutation({
    mutationFn: bulkUpsertTranslations,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["translations", keyId] });
      setDirtyLocales(new Set());
      setError(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  // Handle input change
  const handleValueChange = (locale: string, value: string) => {
    setLocalTranslations((prev) => ({ ...prev, [locale]: value }));
    
    // Mark as dirty if different from initial value
    const isDifferent = value !== (initialTranslations[locale] || "");
    setDirtyLocales((prev) => {
      const next = new Set(prev);
      if (isDifferent) {
        next.add(locale);
      } else {
        next.delete(locale);
      }
      return next;
    });
  };

  // Handle save all
  const handleSaveAll = () => {
    const translationsToSave = Array.from(dirtyLocales).map((locale) => ({
      locale,
      value: localTranslations[locale] || "",
    }));

    if (translationsToSave.length > 0) {
      bulkSaveMutation.mutate({
        keyId,
        translations: translationsToSave,
      });
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    setLocalTranslations(initialTranslations);
    setDirtyLocales(new Set());
    setError(null);
  };

  // Filter data based on selected filter
  const filteredData = allLocaleData.filter((item) => {
    if (filter === "empty") return !item.value || item.value.trim() === "";
    if (filter === "filled") return item.value && item.value.trim() !== "";
    return true;
  });

  // Calculate progress
  const progress = allLocaleData.length > 0
    ? {
        total: allLocaleData.length,
        filled: allLocaleData.filter((item) => item.value && item.value.trim() !== "").length,
      }
    : null;

  const progressPercentage = progress
    ? Math.round((progress.filled / progress.total) * 100)
    : 0;

  // Get status badge for a locale
  const getStatusBadge = (locale: string, exists: boolean, value: string) => {
    if (dirtyLocales.has(locale)) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Modified</Badge>;
    }
    if (!exists || !value || value.trim() === "") {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Missing</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Saved</Badge>;
  };

  if (translationsLoading) return <p>Loading…</p>;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Features", href: "/features" },
          {
            label: keyData?.feature?.name || "Feature",
            href: keyData?.featureId ? `/features/${keyData.featureId}` : undefined,
          },
          { label: keyData?.key || "Translation" },
        ]}
      />

      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold font-mono">{keyData?.key || "Translations"}</h1>
            {keyData?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {keyData.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {progress && (
              <div className="text-right">
                <Badge
                  variant={progressPercentage === 100 ? "success" : "secondary"}
                >
                  {progress.filled}/{progress.total} translated
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {progressPercentage}% complete
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Label htmlFor="filter" className="text-sm">
            Filter:
          </Label>
          <Select value={filter} onValueChange={(v: "all" | "empty" | "filled") => setFilter(v)}>
            <SelectTrigger id="filter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({allLocaleData.length})</SelectItem>
              <SelectItem value="empty">
                Empty ({allLocaleData.filter((t) => !t.value || t.value.trim() === "").length})
              </SelectItem>
              <SelectItem value="filled">
                Filled ({allLocaleData.filter((t) => t.value && t.value.trim() !== "").length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {dirtyLocales.size > 0 && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {dirtyLocales.size} unsaved {dirtyLocales.size === 1 ? "change" : "changes"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={bulkSaveMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={bulkSaveMutation.isPending}
              >
                {bulkSaveMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!bulkSaveMutation.isPending && <Save className="mr-2 h-4 w-4" />}
                Save All Changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Error alert */}
      <ErrorAlert error={error} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Locale</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((item) => (
              <TableRow key={item.locale}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-mono">{item.locale}</span>
                    <span className="text-xs text-muted-foreground">{item.languageName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.value}
                    onChange={(e) => handleValueChange(item.locale, e.target.value)}
                    placeholder="Enter translation..."
                    className={
                      !item.exists || !item.value || item.value.trim() === ""
                        ? "border-dashed border-2 border-red-300"
                        : ""
                    }
                  />
                </TableCell>
                <TableCell>
                  {getStatusBadge(item.locale, item.exists, item.value)}
                </TableCell>
                <TableCell>
                  {item.translationId && (
                    <DeleteTranslationDialog
                      item={{
                        id: item.translationId,
                        locale: item.locale,
                        value: item.value,
                        keyId,
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No translations match the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
