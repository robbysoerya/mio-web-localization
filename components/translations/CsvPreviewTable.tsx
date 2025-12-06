"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Preview table for CSV import
interface CsvPreviewTableProps {
  headers: string[];
  originalHeaders: string[];
  data: Record<string, string>[];
  onHeadersChange: (newHeaders: string[]) => void;
}

export function CsvPreviewTable({
  headers,
  originalHeaders,
  data,
  onHeadersChange,
}: CsvPreviewTableProps) {
  const [editableHeaders, setEditableHeaders] = useState<string[]>(headers);

  useEffect(() => {
    setEditableHeaders(headers);
  }, [headers]);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...editableHeaders];
    newHeaders[index] = value;
    setEditableHeaders(newHeaders);
    onHeadersChange(newHeaders);
  };

  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[300px] w-full rounded-md">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              {editableHeaders.map((header, index) => (
                <TableHead key={index} className="min-w-[150px] p-2">
                  <Input
                    value={header}
                    onChange={(e) => handleHeaderChange(index, e.target.value)}
                    className="h-8 text-xs font-bold bg-background"
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 50).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {originalHeaders.map((header, cellIndex) => (
                  <TableCell key={cellIndex} className="text-xs truncate max-w-[200px]">
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-2 text-xs text-muted-foreground border-t bg-muted/20">
        Showing first {Math.min(data.length, 50)} of {data.length} rows. Edit headers to map columns correctly.
      </div>
    </div>
  );
}
