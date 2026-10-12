import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  ArrowUpRight,
  Calendar,
  Clock,
  FileSearch,
  Grid,
  List,
  PlusCircle,
  Scan,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const CATEGORY_FILTERS = [
  { id: "all", label: "All Records" },
  { id: "comedo", label: "Comedones" },
  { id: "pustul", label: "Pustular" },
  { id: "cyst", label: "Cystic" },
  { id: "rosacea", label: "Rosacea" },
  { id: "pigment", label: "Pigmentation" },
  { id: "perioral", label: "Perioral" },
  { id: "hidradenitis", label: "Hidradenitis" },
]

export function PatientScansPage() {
  const navigate = useNavigate()
  const q = useQuery({ queryKey: ["scans"], queryFn: listScans })
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const filteredScans = useMemo(() => {
    if (!q.data) return []
    let list = q.data

    if (activeFilter !== "all") {
      list = list.filter((item) =>
        item.predictedLabel.toLowerCase().includes(activeFilter.toLowerCase())
      )
    }

    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(
        (item) =>
          item.predictedLabel.toLowerCase().includes(s) ||
          item.scanId.toLowerCase().includes(s)
      )
    }

    return list
  }, [q.data, search, activeFilter])

  const getLabelBadgeStyle = (label: string) => {
    const l = label.toLowerCase()
    if (l.includes("cyst") || l.includes("severe")) {
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
    }
    if (l.includes("pustul")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
    }
    if (l.includes("hidradenitis")) {
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900"
    }
    if (l.includes("perioral")) {
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900"
    }
    if (l.includes("pigment")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900"
    }
    if (l.includes("rosacea")) {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
    }
    return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900"
  }

  const latestScan = q.data?.[0]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* HEADER & METRIC SUMMARY                                   */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Scan Journal
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold"
            >
              {q.data?.length ?? 0} Recorded
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chronological record of your facial skin assessments and OTC recommendations.
          </p>
        </div>

        <Button
          size="sm"
          className="h-10 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-sm shadow-teal-700/20 gap-2 shrink-0 self-start sm:self-center"
          onClick={() => navigate("/app/dashboard")}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Assessment</span>
        </Button>
      </div>

      {/* Metric Tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Evaluations</span>
            <Sparkles className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {q.data?.length ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Encrypted Medical Records</p>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Most Recent Finding</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-base font-bold text-teal-700 dark:text-teal-300 truncate">
            {latestScan ? latestScan.predictedLabel : "No scans yet"}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {latestScan
              ? new Date(latestScan.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Awaiting first assessment"}
          </p>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Diagnostic Scope</span>
            <Scan className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            8 Conditions
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Recognized Clinical Scope</p>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* CONTROLS: SEARCH, CATEGORY FILTERS & VIEW SWITCHER        */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by diagnosis or record ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 rounded-xl border-slate-200 text-xs focus-visible:ring-teal-600 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0",
                activeFilter === f.id
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-700/25"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RECORDS DISPLAY (GRID OR TABLE)                           */}
      {/* ========================================================= */}
      {q.isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <p>Loading journal entries…</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
            <FileSearch className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {search || activeFilter !== "all"
                ? "No matching records found"
                : "No scans recorded yet"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {search || activeFilter !== "all"
                ? "Try clearing your search query or selecting 'All Records'."
                : "Upload or capture a facial photograph in Triage Studio to start your journal."}
            </p>
          </div>
          {search || activeFilter !== "all" ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-slate-300 text-xs mt-2"
              onClick={() => {
                setSearch("")
                setActiveFilter("all")
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs mt-2"
              onClick={() => navigate("/app/dashboard")}
            >
              <Scan className="h-3.5 w-3.5 mr-1.5" />
              Capture First Scan
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScans.map((scan) => (
            <Card
              key={scan.scanId}
              className="group rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60 dark:hover:border-teal-600/60 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getLabelBadgeStyle(
                      scan.predictedLabel
                    )}`}
                  >
                    {scan.predictedLabel}
                  </Badge>

                  <span className="font-mono text-[10px] text-slate-400">
                    #{scan.scanId.slice(-6)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                    {scan.predictedLabel}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(scan.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(scan.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    Evidence-Based OTC
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/50 gap-1 px-2"
                    asChild
                  >
                    <Link to={`/app/results/${encodeURIComponent(scan.scanId)}`}>
                      <span>View Report</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                  <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 pl-6">
                    Date & Time
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                    Condition Finding
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                    Record ID
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 text-right pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((row) => (
                  <TableRow
                    key={row.scanId}
                    className="border-b border-slate-100/80 hover:bg-teal-50/30 dark:border-slate-800/60 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 py-3.5 pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(row.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {new Date(row.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getLabelBadgeStyle(
                          row.predictedLabel
                        )}`}
                      >
                        {row.predictedLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-xs text-slate-400">
                      {row.scanId}
                    </TableCell>
                    <TableCell className="text-right py-3.5 pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/50 gap-1"
                        asChild
                      >
                        <Link to={`/app/results/${encodeURIComponent(row.scanId)}`}>
                          View Report
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
