"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/endpoints/projects";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CreateProjectDialog,
  EditProjectDialog,
  DeleteProjectDialog,
} from "@/components/projects/dialogs";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const filteredProjects = projects?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!projects) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage localization projects and their features
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {!filteredProjects || filteredProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No projects found matching your search."
              : "No projects available. Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex-1 min-w-0 hover:underline"
                >
                  <h2 className="font-semibold truncate">{project.name}</h2>
                </Link>
                <div className="flex items-center gap-1">
                  <EditProjectDialog project={project} />
                  <DeleteProjectDialog project={project} />
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <Badge variant="secondary">Active</Badge>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
