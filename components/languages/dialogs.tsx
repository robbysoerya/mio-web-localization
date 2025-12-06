"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/lib/endpoints/languages";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Language } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function CreateLanguageDialog() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["languages"] });
      setOpen(false);
      setLocale("");
      setName("");
      setIsActive(true);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Language</DialogTitle>
          <DialogDescription>
            Add a new supported language to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="locale">Locale Code</Label>
            <Input
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="e.g. en-US"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. English (US)"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
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
            onClick={() => mutation.mutate({ locale, name, isActive })}
            disabled={!locale || !name || mutation.isPending}
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

export function EditLanguageDialog({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState(language.locale);
  const [name, setName] = useState(language.name);
  const [isActive, setIsActive] = useState(language.isActive);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { locale: string; name: string; isActive: boolean }) =>
      updateLanguage(language.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["languages"] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Language</DialogTitle>
          <DialogDescription>
            Update language details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-locale">Locale Code</Label>
            <Input
              id="edit-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Display Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="edit-isActive">Active</Label>
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
            onClick={() => mutation.mutate({ locale, name, isActive })}
            disabled={!locale || !name || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteLanguageDialog({ language }: { language: Language }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteLanguage(language.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["languages"] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Language</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{language.name}&quot; ({language.locale})? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
