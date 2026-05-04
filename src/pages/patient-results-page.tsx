import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getScan } from "@/features/scans/scans.api"
import type { ScanResult } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import { PillBottle } from "lucide-react"
import { useLocation, useParams } from "react-router-dom"

export function PatientResultsPage() {
  const { scanId: scanIdParam } = useParams()
  const scanId = scanIdParam ? decodeURIComponent(scanIdParam) : undefined
  const location = useLocation() as { state?: { result?: ScanResult } }
  const passed = location.state?.result

  const q = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => getScan(scanId as string),
    enabled: Boolean(scanId) && !passed,
    initialData: passed,
  })

  const data = passed ?? q.data
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading result…
      </div>
    )
  }

  const box = data.highlightRegion

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted">
            <img
              src={data.imageUrl}
              alt="Analyzed"
              className="h-full w-full object-cover"
            />
            {box ? (
              <div
                className="absolute border-2 border-red-500/90 bg-red-500/10"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="border-primary/30">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Detected</p>
              <p className="text-lg font-semibold">{data.predictedLabel}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <Badge variant="secondary">{data.confidencePercent}%</Badge>
              </div>
              <Progress value={data.confidencePercent} />
            </div>
            <p className="text-sm text-muted-foreground">{data.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PillBottle className="h-4 w-4" />
              Recommended OTC Routine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {data.otcSteps.map((s) => (
                <li key={s.rank}>{s.label}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Consult a dermatologist for severe cases. This tool suggests OTC
              options only and does not replace professional care.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
