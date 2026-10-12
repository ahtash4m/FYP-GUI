import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteAdminUser, listAdminUsers } from "@/features/admin/admin.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calendar, Mail, Search, Trash2, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: listAdminUsers })

  const filtered = useMemo(() => {
    const rows = users.data ?? []
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.userId.toLowerCase().includes(s)
    )
  }, [users.data, q])

  const del = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User and associated scan history deleted successfully")
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Delete failed"),
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              User Management
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold"
            >
              {users.data?.length ?? 0} Accounts
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registered patients and administrators in MS SQL Server.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 h-10 rounded-xl border-slate-200 text-xs focus-visible:ring-teal-600 dark:border-slate-800"
            placeholder="Search by name, email, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            Active User Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 pl-6">
                  User
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  Registered On
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 text-center">
                  Total Scans
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u.userId}
                  className="border-b border-slate-100/80 hover:bg-teal-50/30 dark:border-slate-800/60 transition-colors text-xs"
                >
                  <TableCell className="py-3.5 pl-6 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                        <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-semibold">
                          {u.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {u.userId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {u.email}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {u.registrationDate}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <Badge variant="outline" className="font-mono text-xs px-2">
                      {u.totalScans}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-3.5 pr-6">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently delete user ${u.fullName} and their scan history?`)) {
                          del.mutate(u.userId)
                        }
                      }}
                      disabled={del.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
