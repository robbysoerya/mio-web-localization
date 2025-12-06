"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLanguages } from "@/lib/endpoints/languages";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreateLanguageDialog,
  EditLanguageDialog,
  DeleteLanguageDialog,
} from "@/components/languages/dialogs";
import { Loader2 } from "lucide-react";

export default function LanguagesPage() {
  const { data: languages, isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Languages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage supported languages for your application
          </p>
        </div>
        <CreateLanguageDialog />
      </div>

      {!languages || languages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No languages configured. Add one to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {languages.map((language) => (
            <Card key={language.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{language.name}</h2>
                    {language.isActive ? (
                      <Badge variant="success" className="text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {language.locale}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <EditLanguageDialog language={language} />
                  <DeleteLanguageDialog language={language} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
