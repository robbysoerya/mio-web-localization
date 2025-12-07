"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProject } from "@/lib/endpoints/projects";
import { fetchFeatures } from "@/lib/endpoints/features";
import { use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  EditProjectDialog,
  DeleteProjectDialog,
} from "@/components/projects/dialogs";
import {
  CreateFeatureDialog,
  EditFeatureDialog,
  DeleteFeatureDialog,
} from "@/components/features/dialogs";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
  });

  const { data: features } = useQuery({
    queryKey: ["features", id],
    queryFn: () => fetchFeatures(id),
  });

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <EditProjectDialog project={project} />
            <DeleteProjectDialog project={project} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Features</h2>
          <CreateFeatureDialog projectId={id} />
        </div>

        {!features || features.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No features in this project. Create one to get started.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Link
                    href={`/features/${feature.id}`}
                    className="flex-1 min-w-0 hover:underline"
                  >
                    <h3 className="font-semibold truncate">{feature.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1">
                    <EditFeatureDialog feature={feature} />
                    <DeleteFeatureDialog feature={feature} />
                  </div>
                </div>
                {feature.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {feature.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <Badge variant="secondary">
                    {feature.totalKeys || 0} keys
                  </Badge>
                  <Link
                    href={`/features/${feature.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Keys →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
