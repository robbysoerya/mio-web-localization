"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createFeature,
  updateFeature,
  deleteFeature,
} from "@/lib/endpoints/features";
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
import { Textarea } from "@/components/ui/textarea";
import { Feature } from "@/lib/types";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

export function CreateFeatureDialog({ projectId }: { projectId?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [error, setError] = useState<Error | null>(null);
  const qc = useQueryClient();

  // Fetch projects for selection
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { fetchProjects } = await import("@/lib/endpoints/projects");
      return fetchProjects();
    },
    enabled: !projectId, // Only fetch if projectId not provided
  });

  const mutation = useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      setOpen(false);
      setName("");
      setDescription("");
      setSelectedProjectId(projectId || "");
      setError(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Feature
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Feature</DialogTitle>
          <DialogDescription>
            Add a new feature to organize your translation keys.
          </DialogDescription>
        </DialogHeader>
        <ErrorAlert error={error} />
        <div className="grid gap-4 py-4">
          {!projectId && (
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
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
            onClick={() =>
              mutation.mutate({
                name,
                description,
                projectId: projectId || selectedProjectId,
              })
            }
            disabled={!name || !(projectId || selectedProjectId) || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditFeatureDialog({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(feature.name);
  const [description, setDescription] = useState(feature.description || "");
  const [error, setError] = useState<Error | null>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      updateFeature(feature.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["feature", feature.id] });
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
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Feature</DialogTitle>
          <DialogDescription>
            Update feature details.
          </DialogDescription>
        </DialogHeader>
        <ErrorAlert error={error} />
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            onClick={() => mutation.mutate({ name, description })}
            disabled={!name || mutation.isPending}
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

export function DeleteFeatureDialog({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteFeature(feature.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
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
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Feature</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{feature.name}&quot;? This action cannot be undone and will delete all associated keys and translations.
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
