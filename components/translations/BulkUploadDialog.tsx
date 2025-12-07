"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkUploadTranslations,
  BulkUploadResult,
} from "@/lib/endpoints/translations";
import { fetchFeatures } from "@/lib/endpoints/features";
import { fetchLanguages } from "@/lib/endpoints/languages";
import { useProject } from "@/contexts/ProjectContext";
import { Language, Feature } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";
import { CsvPreviewTable } from "./CsvPreviewTable";

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(
    null
  );
  const qc = useQueryClient();
  const { selectedProjectId } = useProject();

  const { data: features } = useQuery<Feature[]>({
    queryKey: ["features", selectedProjectId],
    queryFn: () => fetchFeatures(selectedProjectId),
  });

  const { data: languages } = useQuery<Language[]>({
    queryKey: ["languages", selectedProjectId],
    queryFn: () => fetchLanguages(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const mutation = useMutation({
    mutationFn: ({ featureId, file }: { featureId: string; file: File }) =>
      bulkUploadTranslations(featureId, file),
    onSuccess: (data) => {
      setUploadResult(data);
      qc.invalidateQueries({ queryKey: ["translations-search"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setUploadResult({
        error: true,
        message: error.response?.data?.message || "Upload failed",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (file: File) => {
    setIsParsing(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
        const fields = results.meta.fields || [];
        setHeaders(fields);
        setOriginalHeaders(fields);
        setIsParsing(false);
      },
      error: (error: Error) => {
        console.error("CSV Parse Error:", error);
        setIsParsing(false);
      },
    });
  };

  const handleUpload = () => {
    if (parsedData.length > 0 && selectedFeature && languages) {
      // Get valid language codes
      const validLocales = new Set(languages.map((l: { locale: string }) => l.locale));
      validLocales.add("key"); // Always allow 'key'

      // Reconstruct CSV with potentially modified headers
      // We need to map the data from original keys to new keys
      // AND filter out columns that are not in validLocales
      const mappedData = parsedData.map(row => {
        const newRow: Record<string, string> = {};
        originalHeaders.forEach((originalHeader, index) => {
          const newHeader = headers[index];
          if (validLocales.has(newHeader)) {
            newRow[newHeader] = row[originalHeader];
          }
        });
        return newRow;
      });

      // Only include headers that are valid
      const validHeaders = headers.filter(h => validLocales.has(h));

      const csv = Papa.unparse({
        fields: validHeaders,
        data: mappedData
      });
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const newFile = new File([blob], file?.name || "upload.csv", { type: "text/csv" });
      
      mutation.mutate({ featureId: selectedFeature, file: newFile });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setOriginalHeaders([]);
    setSelectedFeature("");
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Upload Translations</DialogTitle>
          <DialogDescription>
            Upload a CSV file. You can rename columns below to match system locales (e.g., rename &quot;Indonesian&quot; to &quot;id&quot;).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 px-1 overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="feature">Feature</Label>
            <div className="max-w-sm">
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger 
                  id="feature" 
                  className="w-full focus:ring-offset-0 focus:ring-1 dark:focus:ring-gray-600"
                >
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {features?.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!file ? (
            <div className="grid gap-2">
              <Label htmlFor="file">CSV File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV files only</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {parsedData.length} rows found
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsedData([]); }}>
                  Change File
                </Button>
              </div>

              {isParsing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Parsing CSV...</span>
                </div>
              ) : (
                <CsvPreviewTable 
                  headers={headers} 
                  originalHeaders={originalHeaders}
                  data={parsedData} 
                  onHeadersChange={setHeaders} 
                />
              )}
            </div>
          )}

          {uploadResult && (
            <Alert
              variant={uploadResult.error ? "destructive" : "default"}
              className={
                uploadResult.error
                  ? ""
                  : "border-green-200 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900"
              }
            >
              {uploadResult.error ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <AlertDescription>
                {uploadResult.error ? (
                  <div>
                    <strong>Error:</strong> {uploadResult.message}
                  </div>
                ) : (
                  <div>
                    <strong>Success!</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>Created: {uploadResult.created || 0} translations</li>
                      <li>Updated: {uploadResult.updated || 0} translations</li>
                      <li>Skipped: {uploadResult.skipped || 0} translations</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {uploadResult && !uploadResult.error ? "Done" : "Cancel"}
          </Button>
          {(!uploadResult || uploadResult.error) && (
            <Button
              onClick={handleUpload}
              disabled={!file || !selectedFeature || mutation.isPending || isParsing}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import Data
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
