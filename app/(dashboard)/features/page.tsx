"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFeatures } from "@/lib/endpoints/features";
import { useRouter } from "next/navigation";
import { useProject } from "@/contexts/ProjectContext";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CreateFeatureDialog,
  EditFeatureDialog,
  DeleteFeatureDialog,
} from "@/components/features/dialogs";
import { AITranslateBatchDialog } from "@/components/features/AITranslateBatchDialog";

export default function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedProjectId } = useProject();
  const router = useRouter();

  // Redirect to dashboard if no project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      router.push("/dashboard");
    }
  }, [selectedProjectId, router]);

  const { data: features } = useQuery({
    queryKey: ["features", selectedProjectId],
    queryFn: () => fetchFeatures(selectedProjectId || undefined),
  });

  const filteredFeatures = features?.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!features) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Features</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage localization features and their keys
          </p>
        </div>
        <CreateFeatureDialog projectId={selectedProjectId || undefined} />
      </div>

      {features.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {!filteredFeatures || filteredFeatures.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No features found matching your search."
              : "No features available. Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <Card
              key={feature.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <Link
                  href={`/features/${feature.id}`}
                  className="flex-1 min-w-0 hover:underline"
                >
                  <h2 className="font-semibold truncate">{feature.name}</h2>
                </Link>
                <div className="flex items-center gap-1">
                  <AITranslateBatchDialog
                    featureId={feature.id}
                    featureName={feature.name}
                    totalKeys={feature.totalKeys}
                  />
                  <EditFeatureDialog feature={feature} />
                  <DeleteFeatureDialog feature={feature} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {feature.description || "No description"}
              </p>
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
  );
}
