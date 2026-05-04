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
import {
  Activity,
  ClipboardList,
  Power,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function AdminOverviewPage() {
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Backed by{" "}
          <code className="rounded bg-muted px-1">/api/admin/stats</code> and related
          endpoints when integrated.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-primary/40 bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{s?.totalUsers ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{s?.scansToday ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{s?.pendingReviews ?? "—"}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Placeholder metric — define workflow or hide if unused.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-semibold capitalize">
              <span
                className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                aria-hidden
              />
              {s?.systemStatus ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acne Types Detected (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {types.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={types.data}>
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 500]} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Loading chart…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.data?.map((row, i) => (
                <TableRow key={`${row.userId}-${i}`}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
