"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTranslation,
  deleteTranslation,
  fetchTranslations,
} from "@/lib/endpoints/translations";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Translation } from "@/lib/types";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

export function CreateTranslationDialog({ keyId }: { keyId: string }) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const qc = useQueryClient();
  const { selectedProjectId } = useProject();

  // Fetch available languages
  const { data: languages } = useQuery({
    queryKey: ["languages", selectedProjectId],
    queryFn: () => fetchLanguages(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Fetch existing translations for this key
  const { data: existingTranslations } = useQuery({
    queryKey: ["translations", keyId],
    queryFn: () => fetchTranslations(keyId),
    enabled: !!keyId,
  });

  // Filter out languages that already have translations and only show active languages
  const availableLanguages = languages?.filter(
    (lang) =>
      lang.isActive &&
      !existingTranslations?.some((trans) => trans.locale === lang.locale)
  );

  const mutation = useMutation({
    mutationFn: createTranslation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["translations", keyId] });
      setOpen(false);
      setLocale("");
      setValue("");
      setError(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  // Check if all active languages have translations
  const allActiveLanguagesTranslated =
    languages &&
    existingTranslations &&
    availableLanguages?.length === 0 &&
    languages.filter((lang) => lang.isActive).length > 0;

  // If all active languages are translated, show a badge instead of the button
  if (allActiveLanguagesTranslated) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Check className="h-3 w-3" />
        All active languages translated
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Translation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Translation</DialogTitle>
          <DialogDescription>
            Add a new translation for a specific locale.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ErrorAlert error={error} />
          <div className="grid gap-2">
            <Label htmlFor="locale">Locale</Label>
            {availableLanguages && availableLanguages.length > 0 ? (
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger id="locale">
                  <SelectValue placeholder="Select a locale" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.locale}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{lang.locale}</span>
                        <span className="text-muted-foreground">
                          - {lang.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {languages && languages.length === 0
                  ? "No languages available. Please add languages first."
                  : existingTranslations &&
                    existingTranslations.length === languages?.length
                  ? "All available languages already have translations."
                  : "Loading languages..."}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Translation Value</Label>
            <Textarea
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter translation text..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate({ keyId, locale, value })}
            disabled={!locale || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTranslationDialog({ item }: { item: Translation }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteTranslation(item.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["translations", item.keyId] });
      setOpen(false);
      setError(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Translation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the translation for &quot;{item.locale}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <ErrorAlert error={error} />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
