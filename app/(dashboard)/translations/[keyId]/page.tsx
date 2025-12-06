"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTranslations,
  updateTranslation,
} from "@/lib/endpoints/translations";
import { fetchKey } from "@/lib/endpoints/keys";
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
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import {
  CreateTranslationDialog,
  DeleteTranslationDialog,
} from "@/components/translations/dialogs";
import { TranslationMemory } from "@/components/translations/TranslationMemory";

export default function TranslationEditor() {
  const params = useParams();
  const keyId = params.keyId as string;
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "empty" | "filled">("all");
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const { data: keyData } = useQuery({
    queryKey: ["key", keyId],
    queryFn: () => fetchKey(keyId),
    enabled: !!keyId,
    retry: false,
    // Ignore errors if the endpoint doesn't exist
    throwOnError: false,
  });

  const { data } = useQuery({
    queryKey: ["translations", keyId],
    queryFn: () => fetchTranslations(keyId),
    enabled: !!keyId,
  });

  const mutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      updateTranslation(id, value),
    onMutate: ({ id }) => {
      setSavingIds((prev) => new Set(prev).add(id));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["translations", keyId] });
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSavedIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    },
    onError: (_, { id }) => {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const filteredData = data?.filter((t) => {
    if (filter === "empty") return !t.value || t.value.trim() === "";
    if (filter === "filled") return t.value && t.value.trim() !== "";
    return true;
  });

  const progress = data
    ? {
        total: data.length,
        filled: data.filter((t) => t.value && t.value.trim() !== "").length,
      }
    : null;

  const progressPercentage = progress
    ? Math.round((progress.filled / progress.total) * 100)
    : 0;

  if (!data) return <p>Loading…</p>;

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
            <CreateTranslationDialog keyId={keyId} />
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
              <SelectItem value="all">All ({data.length})</SelectItem>
              <SelectItem value="empty">
                Empty ({data.filter((t) => !t.value || t.value.trim() === "").length})
              </SelectItem>
              <SelectItem value="filled">
                Filled ({data.filter((t) => t.value && t.value.trim() !== "").length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Translation Memory */}
      {data && data.length > 1 && (
        <div className="mb-6">
          <TranslationMemory translations={data} />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Locale</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.locale}</TableCell>
                <TableCell>
                  <Input
                    defaultValue={t.value ?? ""}
                    onBlur={(e) =>
                      mutation.mutate({
                        id: t.id,
                        value: e.target.value,
                      })
                    }
                    placeholder="Enter translation..."
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center h-full">
                    {savingIds.has(t.id) && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {savedIds.has(t.id) && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DeleteTranslationDialog item={t} />
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
