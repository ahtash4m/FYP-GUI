import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getAcneTypeStats,
  getActivityLog,
  getAdminStats,
} from "@/features/admin/admin.api"
import { useQuery } from "@tanstack/react-query"
import { useTheme } from "@/providers/theme-provider"
import {
  Activity,
  BarChart3,
  ClipboardList,
  Clock,
  Power,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function AdminOverviewPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats })
  const types = useQuery({
    queryKey: ["admin", "acne-types"],
    queryFn: getAcneTypeStats,
  })
  const activity = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: getActivityLog,
  })

  const s = stats.data

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
          <Activity className="h-3.5 w-3.5 text-teal-600" />
          Clinical Operations Dashboard
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System Overview & Metrics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time patient throughput, lesion classification breakdown, and audit trails.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Users */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Users
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {s?.totalUsers ?? "—"}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Registered patient cohort</span>
            </p>
          </CardContent>
        </Card>

        {/* Scans Today */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scans Today
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {s?.scansToday ?? "—"}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Processed in last 24h
            </p>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Reviews
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {s?.pendingReviews ?? "—"}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Scans below confidence threshold
            </p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inference Status
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Power className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span>{s?.systemStatus ?? "Operational"}</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Flask & MobileNetV2 Synchronized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Disease Distribution Chart */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-600" />
              Acne Classification Distribution
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of primary lesion classifications observed across all patient scans (Last 30 Days).
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            30-Day Window
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-72 w-full">
            {types.data ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={types.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#334155" : "#E2E8F0"}
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B" }}
                    axisLine={{ stroke: isDark ? "#334155" : "#E2E8F0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B" }}
                    axisLine={{ stroke: isDark ? "#334155" : "#E2E8F0" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: isDark ? "1px solid #334155" : "1px solid #CBD5E1",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    }}
                    itemStyle={{
                      color: isDark ? "#38BDF8" : "#0D9488",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={isDark ? "#14B8A6" : "#0D9488"}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading classification metrics…
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Audit Log */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Live Audit & Activity Log
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time audit log of scans processed and administrative events.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 pl-6">
                  Timestamp
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  User ID
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  Action Executed
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 text-right pr-6">
                  Triage Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.data?.map((row, i) => (
                <TableRow
                  key={`${row.userId}-${i}`}
                  className="border-b border-slate-100/80 hover:bg-teal-50/30 dark:border-slate-800/60 transition-colors text-xs"
                >
                  <TableCell className="py-3.5 pl-6 font-medium text-slate-500 dark:text-slate-400">
                    {row.date}
                  </TableCell>
                  <TableCell className="py-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {row.userId}
                  </TableCell>
                  <TableCell className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {row.action}
                  </TableCell>
                  <TableCell className="py-3.5 text-right pr-6">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        row.status.toLowerCase().includes("success")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
