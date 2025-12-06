import { DuplicateKey } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface HealthIndicatorsProps {
  orphanedKeysCount: number;
  duplicateKeys: DuplicateKey[];
  activeFeaturesWithMissingTranslations: number;
}

export function HealthIndicators({
  orphanedKeysCount,
  duplicateKeys,
  activeFeaturesWithMissingTranslations,
}: HealthIndicatorsProps) {
  const hasIssues =
    orphanedKeysCount > 0 ||
    duplicateKeys.length > 0 ||
    activeFeaturesWithMissingTranslations > 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        System Health
      </h3>

      <div className="space-y-4">
        {/* Orphaned Keys */}
        {orphanedKeysCount > 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{orphanedKeysCount}</strong> orphaned key
              {orphanedKeysCount !== 1 ? "s" : ""} found (keys with no
              translations in any locale)
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              No orphaned keys
            </AlertDescription>
          </Alert>
        )}

        {/* Duplicate Keys */}
        {duplicateKeys.length > 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{duplicateKeys.length}</strong> duplicate key
              {duplicateKeys.length !== 1 ? "s" : ""} found
              <div className="mt-3 space-y-2">
                {duplicateKeys.map((dup, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded border text-sm"
                  >
                    <p className="font-medium mb-2">{dup.keyName}</p>
                    <div className="flex flex-wrap gap-1">
                      {dup.features.map((feature) => (
                        <Badge key={feature.featureId} variant="outline">
                          {feature.featureName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              No duplicate keys
            </AlertDescription>
          </Alert>
        )}

        {/* Active Features with Missing Translations */}
        {activeFeaturesWithMissingTranslations > 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{activeFeaturesWithMissingTranslations}</strong> active
              feature{activeFeaturesWithMissingTranslations !== 1 ? "s" : ""}{" "}
              with incomplete translations
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              All active features have complete translations
            </AlertDescription>
          </Alert>
        )}

        {!hasIssues && (
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ All systems healthy!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
