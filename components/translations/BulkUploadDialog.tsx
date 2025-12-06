"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkUploadTranslations,
  BulkUploadResult,
} from "@/lib/endpoints/translations";
import { fetchFeatures } from "@/lib/endpoints/features";
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

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [featureId, setFeatureId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(
    null
  );
  const qc = useQueryClient();

  const { data: features } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
  });

  const mutation = useMutation({
    mutationFn: ({ featureId, file }: { featureId: string; file: File }) =>
      bulkUploadTranslations(featureId, file),
    onSuccess: (data) => {
      setUploadResult(data);
      qc.invalidateQueries({ queryKey: ["translations-search"] });
      qc.invalidateQueries({ queryKey: ["statistics"] });
      // Don't close dialog immediately so user can see results
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
    }
  };

  const handleUpload = () => {
    if (file && featureId) {
      mutation.mutate({ featureId, file });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setFeatureId("");
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Translations</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import translations. Format: Key, en, id, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="feature">Feature</Label>
            <Select value={featureId} onValueChange={setFeatureId}>
              <SelectTrigger id="feature">
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

          <div className="grid gap-2">
            <Label htmlFor="file">CSV File</Label>
            <input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {uploadResult && (
            <Alert
              variant={uploadResult.error ? "destructive" : "default"}
              className={
                uploadResult.error
                  ? ""
                  : "border-green-200 bg-green-50 text-green-900"
              }
            >
              {uploadResult.error ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
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
              disabled={!file || !featureId || mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
