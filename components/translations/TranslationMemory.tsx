import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { Translation } from "@/lib/types";
import { useState } from "react";

interface TranslationMemoryProps {
  translations: Translation[];
  currentLocale?: string;
  onCopy?: (value: string) => void;
}

export function TranslationMemory({
  translations,
  currentLocale,
  onCopy,
}: TranslationMemoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter out current locale if provided
  const otherTranslations = currentLocale
    ? translations.filter((t) => t.locale !== currentLocale)
    : translations;

  if (!otherTranslations || otherTranslations.length === 0) {
    return null;
  }

  const handleCopy = async (translation: Translation) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(translation.value);
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = translation.value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopiedId(translation.id);
      setTimeout(() => setCopiedId(null), 2000);

      if (onCopy) {
        onCopy(translation.value);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      // Show error to user
      alert("Failed to copy to clipboard. Please copy manually.");
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Translation Memory</h3>
      <div className="space-y-2">
        {otherTranslations.map((translation) => (
          <div
            key={translation.id}
            className="flex items-start justify-between gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="mb-1">
                {translation.locale}
              </Badge>
              <p className="text-sm break-words">
                {translation.value || (
                  <span className="text-muted-foreground italic">(empty)</span>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(translation)}
              className="shrink-0"
            >
              {copiedId === translation.id ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
