import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getScan } from "@/features/scans/scans.api"
import type { ScanResult } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  PillBottle,
  PlusCircle,
  Printer,
  ShieldCheck,
  Sparkles,
  ZoomIn,
} from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"

export function PatientResultsPage() {
  const { scanId: scanIdParam } = useParams()
  const scanId = scanIdParam ? decodeURIComponent(scanIdParam) : undefined
  const location = useLocation() as { state?: { result?: ScanResult } }
  const passed = location.state?.result
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<"routine" | "pathology">("routine")
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})
  const [isZoomed, setIsZoomed] = useState(false)

  const q = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => getScan(scanId as string),
    enabled: Boolean(scanId) && !passed,
    initialData: passed,
  })

  const data = passed ?? q.data
  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Retrieving skin analysis report…</p>
      </div>
    )
  }

  const box = data.highlightRegion
  const toggleStep = (rank: number) => {
    setCompletedSteps((prev) => ({ ...prev, [rank]: !prev[rank] }))
  }

  const completedCount = Object.values(completedSteps).filter(Boolean).length
  const totalCount = data.otcSteps.length

  const getBadgeStyle = (label: string) => {
    const l = label.toLowerCase()
    if (l.includes("cyst") || l.includes("severe")) {
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
    }
    if (l.includes("pustul")) {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
    }
    if (l.includes("hidradenitis")) {
      return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900"
    }
    if (l.includes("rosacea")) {
      return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
    }
    return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900"
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* TOP NAVIGATION & ACTION BAR                               */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              onClick={() => navigate("/app/scans")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Journal
            </Button>
            <Badge
              variant="outline"
              className="border-teal-200 bg-teal-50 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300"
            >
              <FileText className="h-3 w-3 mr-1 text-teal-600" />
              Skin Health Report
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Diagnostic Analysis Report
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            Print Report
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm shadow-teal-700/20"
            onClick={() => navigate("/app/dashboard")}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN REPORT GRID                                       */}
      {/* ========================================================= */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: LESION IMAGE & SCAN METADATA (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-0">
              <div
                className={cn(
                  "relative aspect-square bg-slate-950 overflow-hidden cursor-pointer select-none transition-all duration-300",
                  isZoomed && "ring-2 ring-teal-500"
                )}
                onClick={() => setIsZoomed(!isZoomed)}
                title="Click to toggle magnified lesion view"
              >
                <img
                  src={data.imageUrl}
                  alt="Analyzed Lesion"
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-300",
                    isZoomed ? "scale-150" : "scale-100"
                  )}
                />

                {/* Bounding box marker */}
                {box && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded shadow-sm pointer-events-none"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  />
                )}

                {/* Top overlay pills */}
                <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-teal-400" />
                  <span>{isZoomed ? "1.5x (Click to reset)" : "Inspect Zoom"}</span>
                </div>

                <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cura Calibrated Image</span>
                </div>
              </div>

              {/* Scan Record Metadata */}
              <div className="p-4 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/40 text-xs border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Report ID</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                    {data.scanId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Analysis Core</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    Clinical AI Diagnostics
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Record Security</span>
                  <span className="text-slate-700 dark:text-slate-200">
                    Encrypted Medical Vault
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Protocol Standard</span>
                  <span className="text-slate-700 dark:text-slate-200">
                    Evidence-Based OTC
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Guidance Box */}
          <div className="rounded-2xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Recommended Follow-Up</span>
            </div>
            <p className="text-xs text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
              Maintain the recommended OTC routine daily for 14 consecutive days before taking a comparison scan to observe epidermal improvement.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC REPORT & ROUTINE CHECKLIST (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Diagnostic Result Hero Card */}
          <Card className="rounded-2xl border-teal-200/80 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 shadow-sm dark:border-teal-900/50">
            <CardHeader className="pb-3 border-b border-teal-100/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                  Clinical Classification
                </span>
                <Badge
                  variant="outline"
                  className={cn("font-bold text-xs px-2.5 py-0.5 rounded-lg border", getBadgeStyle(data.predictedLabel))}
                >
                  Active Finding
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                {data.predictedLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {data.description}
              </p>
            </CardContent>
          </Card>

          {/* Interactive Protocol Tabs */}
          <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-900/30">
                  <PillBottle className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Clinical Action Protocol
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step-by-step skincare regimen tailored for {data.predictedLabel}.
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("routine")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                    activeTab === "routine"
                      ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Daily Routine
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pathology")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                    activeTab === "pathology"
                      ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Clinical Pathology
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {activeTab === "routine" ? (
                <>
                  {/* Progress tracker */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                    <span>Regimen Progress</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {completedCount} of {totalCount} completed today
                    </span>
                  </div>

                  {/* OTC Steps Checklist */}
                  <div className="space-y-2.5">
                    {data.otcSteps.map((s) => {
                      const isChecked = !!completedSteps[s.rank]
                      return (
                        <div
                          key={s.rank}
                          onClick={() => toggleStep(s.rank)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none",
                            isChecked
                              ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20"
                              : "border-slate-100 bg-slate-50/60 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80"
                          )}
                        >
                          <button
                            type="button"
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm",
                              isChecked
                                ? "bg-emerald-600 text-white shadow-emerald-600/20"
                                : "bg-teal-600 text-white shadow-teal-600/20"
                            )}
                          >
                            {isChecked ? <CheckCircle2 className="h-4 w-4" /> : s.rank}
                          </button>
                          <div className="pt-0.5 space-y-0.5">
                            <p
                              className={cn(
                                "text-sm font-semibold transition-colors leading-snug",
                                isChecked
                                  ? "text-slate-500 dark:text-slate-400 line-through"
                                  : "text-slate-900 dark:text-white"
                              )}
                            >
                              {s.label}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {s.rank === 1 ? "Step 1 • Morning & Evening" : `Step ${s.rank} • Targeted Protocol`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* Pathology Explainer Tab */
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Pathophysiological Factors
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {data.predictedLabel} arises from follicular duct occlusion coupled with micro-environment alterations. Normal sebum production interacts with desquamated keratinocytes, creating an environment favorable for local microbial proliferation and inflammation.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Recommended Actions
                      </span>
                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>Wash face gently with lukewarm water</li>
                        <li>Apply non-comedogenic sunscreen daily</li>
                        <li>Maintain consistent AM/PM routine</li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20 p-3.5 space-y-1">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Behaviors to Avoid
                      </span>
                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
                        <li>Do not squeeze, pick, or scratch</li>
                        <li>Avoid abrasive scrubbing beads</li>
                        <li>Avoid heavy pore-clogging oils</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Safety Disclaimer Callout */}
              <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                    <strong className="font-semibold">Clinical Note:</strong> Cura provides educational
                    over-the-counter triage. For cystic acne, severe scarring, or lesions that do not
                    respond after 4–6 weeks, consult an in-person certified dermatologist.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
