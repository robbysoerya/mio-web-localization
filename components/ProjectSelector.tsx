"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/endpoints/projects";
import { useProject } from "@/contexts/ProjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderKanban } from "lucide-react";
import { useEffect } from "react";

export function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId } = useProject();
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Auto-select first project if only one exists and none selected
  useEffect(() => {
    if (projects && projects.length === 1 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  if (!projects || projects.length === 0) {
    return null;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const showAllProjectsOption = projects.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        Project
      </label>
      <Select
        value={selectedProjectId || "all"}
        onValueChange={(value) => setSelectedProjectId(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedProject ? (
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                <span className="font-medium">{selectedProject.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">All Projects</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showAllProjectsOption && (
            <SelectItem value="all">
              <span className="font-medium">All Projects</span>
            </SelectItem>
          )}
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
