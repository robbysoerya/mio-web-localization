"use client";

import { useQuery } from "@tanstack/react-query";
import { searchTranslations } from "@/lib/endpoints/translations";
import { fetchLanguages } from "@/lib/endpoints/languages";
import { fetchFeatures } from "@/lib/endpoints/features";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  generateCSV,
  downloadCSV,
  getUniqueLocales,
  formatFilename,
} from "@/lib/utils/exportUtils";
import { Download } from "lucide-react";
import { BulkUploadDialog } from "@/components/translations/BulkUploadDialog";

interface SortIconProps {
  column: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

function SortIcon({ column, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== column) {
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
  }
  return (
    <ArrowUpDown
      className={`h-4 w-4 ml-1 ${
        sortOrder === "asc" ? "rotate-180" : ""
      } transition-transform`}
    />
  );
}

export default function AllTranslationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<string>("all");
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch languages for filter
  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  // Fetch features for filter
  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
  });

  // Fetch translations with search and filters
  const { data, isLoading } = useQuery({
    queryKey: [
      "translations-search",
      debouncedSearch,
      selectedLocale,
      selectedFeature,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      searchTranslations({
        q: debouncedSearch || undefined,
        locale: selectedLocale !== "all" ? selectedLocale : undefined,
        featureId: selectedFeature !== "all" ? selectedFeature : undefined,
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      }),
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedLocale("all");
    setSelectedFeature("all");
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || selectedLocale !== "all" || selectedFeature !== "all";

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Translations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and browse all translations across features
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.meta && (
            <Badge variant="secondary">{data.meta.total} translations</Badge>
          )}
          {data?.data && data.data.length > 0 && (
            <>
              <BulkUploadDialog />
              <Button
                variant="outline"
                onClick={() => {
                  // Get all unique locales from data
                  const allLocales = getUniqueLocales(data.data);
                  
                  // Filter to only include active languages
                  const activeLocales = allLocales.filter((locale) =>
                    languages?.some((lang) => lang.locale === locale && lang.isActive)
                  );
                  
                  const csv = generateCSV(data.data, activeLocales);
                  const filename = formatFilename(
                    hasActiveFilters ? "translations_filtered" : "translations_all"
                  );
                  downloadCSV(filename, csv);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keys, values, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Locale Filter */}
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger>
              <SelectValue placeholder="All locales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locales</SelectItem>
              {languages?.map((lang) => (
                <SelectItem key={lang.id} value={lang.locale}>
                  {lang.locale} - {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Feature Filter */}
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger>
              <SelectValue placeholder="All features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All features</SelectItem>
              {features?.map((feature) => (
                <SelectItem key={feature.id} value={feature.id}>
                  {feature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {debouncedSearch && (
              <Badge variant="secondary">
                Search: &quot;{debouncedSearch}&quot;
              </Badge>
            )}
            {selectedLocale !== "all" && (
              <Badge variant="secondary">
                Locale:{" "}
                {languages?.find((l) => l.locale === selectedLocale)?.name ||
                  selectedLocale}
              </Badge>
            )}
            {selectedFeature !== "all" && (
              <Badge variant="secondary">
                Feature:{" "}
                {features?.find((f) => f.id === selectedFeature)?.name ||
                  "Unknown"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading translations...</p>
        </Card>
      ) : !data?.data || data.data.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "No translations found matching your filters."
              : "No translations available."}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("keyName")}
                  >
                    <div className="flex items-center">
                      Key Name
                      <SortIcon column="keyName" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("locale")}
                  >
                    <div className="flex items-center">
                      Locale
                      <SortIcon column="locale" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("featureName")}
                  >
                    <div className="flex items-center">
                      Feature
                      <SortIcon column="featureName" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("updatedAt")}
                  >
                    <div className="flex items-center">
                      Last Updated
                      <SortIcon column="updatedAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {translation.keyName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{translation.locale}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">
                        {translation.value || (
                          <span className="text-muted-foreground italic">
                            (empty)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {translation.featureName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(translation.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/translations/${translation.keyId}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              pageSize={data.meta.limit}
              totalItems={data.meta.total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
