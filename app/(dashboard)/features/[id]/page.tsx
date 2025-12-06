"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchKeys } from "@/lib/endpoints/keys";
import { fetchFeature } from "@/lib/endpoints/features";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useParams } from "next/navigation";
import {
  CreateKeyDialog,
  EditKeyDialog,
  DeleteKeyDialog,
} from "@/components/keys/dialogs";

export default function FeaturePage() {
  const params = useParams();
  const id = params.id as string;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: feature } = useQuery({
    queryKey: ["feature", id],
    queryFn: () => fetchFeature(id),
    enabled: !!id,
  });

  const { data: keys } = useQuery({
    queryKey: ["keys", id],
    queryFn: () => fetchKeys(id),
    enabled: !!id,
  });

  const filteredKeys = keys?.filter((k) =>
    k.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!keys) return <p>Loading...</p>;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Features", href: "/features" },
          { label: feature?.name || "Feature" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{feature?.name || "Keys"}</h1>
          {feature?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description}
            </p>
          )}
        </div>
        <CreateKeyDialog featureId={id} />
      </div>

      {keys.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {!filteredKeys || filteredKeys.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "No keys found matching your search." : "No keys available. Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredKeys.map((k) => (
            <Card
              key={k.id}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/translations/${k.id}`} className="hover:underline">
                    <div className="font-mono text-sm font-medium mb-1">
                      {k.key}
                    </div>
                  </Link>
                  {k.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {k.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Link href={`/translations/${k.id}`}>
                      <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                        Manage Translations
                      </Badge>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <EditKeyDialog item={k} />
                  <DeleteKeyDialog item={k} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
