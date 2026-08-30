'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Right-align and use tabular figures. For money and counts. */
  numeric?: boolean;
}

/**
 * A list screen, given a query result and a column set.
 *
 * Four of the five lender screens are "fetch a collection, show it as rows". Writing
 * that by hand four times per bank produces slightly different loading states and four
 * places for an `undefined.map` to hide. A screen that needs more than a table stops
 * using this and writes a real component — that is the intended exit.
 */
export function DataTable<T extends { id?: string }>({
  title,
  description,
  columns,
  query,
  empty = 'Nothing here yet.',
}: {
  title: string;
  description?: string;
  columns: Column<T>[];
  query: { data?: T[]; isLoading: boolean; error: unknown };
  empty?: string;
}) {
  const rows = query.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="pt-6">
          {query.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : query.error ? (
            // Deliberately plain. The API refuses a file that is not this lender's with
            // the same words it uses for one that does not exist, and the screen must
            // not add detail that distinguishes them.
            <p className="text-sm text-muted-foreground">
              That information is not available.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{empty}</p>
          ) : (
            // The table scrolls in its own box; the page body never scrolls sideways.
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c.header} className={c.numeric ? 'text-right' : undefined}>
                        {c.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={row.id ?? i}>
                      {columns.map((c) => (
                        <TableCell
                          key={c.header}
                          className={c.numeric ? 'text-right tabular-nums' : undefined}
                        >
                          {c.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
