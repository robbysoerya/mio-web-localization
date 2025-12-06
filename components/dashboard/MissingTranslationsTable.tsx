import { MissingTranslation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MissingTranslationsTableProps {
  data: MissingTranslation[];
}

export function MissingTranslationsTable({
  data,
}: MissingTranslationsTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Missing Translations</h3>
        <p className="text-sm text-muted-foreground">
          🎉 All translations are complete!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Missing Translations ({data.length})
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Missing Locales</TableHead>
              <TableHead>Filled Locales</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.keyId}>
                <TableCell className="font-medium">{item.keyName}</TableCell>
                <TableCell>{item.featureName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.missingLocales.map((locale) => (
                      <Badge key={locale} variant="destructive">
                        {locale}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.filledLocales.map((locale) => (
                      <Badge key={locale} variant="secondary">
                        {locale}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/translations/${item.keyId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
