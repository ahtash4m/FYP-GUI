import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listScans } from "@/features/scans/scans.api"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

export function PatientScansPage() {
  const q = useQuery({ queryKey: ["scans"], queryFn: listScans })

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Scans</h1>
        <p className="text-sm text-muted-foreground">
          History is loaded from <code className="rounded bg-muted px-1">GET /api/scans</code>{" "}
          when mocks are off.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scan history</CardTitle>
          <CardDescription>Most recent results appear first.</CardDescription>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.map((row) => (
                  <TableRow key={row.scanId}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{row.predictedLabel}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.confidencePercent}%</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/app/results/${encodeURIComponent(row.scanId)}`}
                          state={undefined}
                        >
                          Open
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
