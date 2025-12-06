import { TranslationListItem } from "../types";

interface ExportData {
  [key: string]: {
    [locale: string]: string;
  };
}

export function generateCSV(
  translations: TranslationListItem[],
  locales: string[]
): string {
  // Group translations by key
  const grouped: ExportData = {};

  translations.forEach((t) => {
    if (!grouped[t.keyName]) {
      grouped[t.keyName] = {};
    }
    grouped[t.keyName][t.locale] = t.value;
  });

  // Create CSV header: Key, locale1, locale2, ...
  const header = ["Key", ...locales].join(",");

  // Create CSV rows
  const rows = Object.entries(grouped).map(([key, localeValues]) => {
    const values = locales.map((locale) => {
      const value = localeValues[locale] || "";
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    return [key, ...values].join(",");
  });

  return [header, ...rows].join("\n");
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function getUniqueLocales(translations: TranslationListItem[]): string[] {
  const locales = new Set<string>();
  translations.forEach((t) => locales.add(t.locale));
  return Array.from(locales).sort();
}

export function formatFilename(prefix: string = "translations"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}_${date}.csv`;
}
