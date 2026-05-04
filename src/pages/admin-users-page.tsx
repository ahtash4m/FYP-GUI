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
import { Eye, Trash2 } from "lucide-react"
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
      toast.success("User deleted (mock)")
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Delete failed"),
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Data from <code className="rounded bg-muted px-1">GET /api/admin/users</code>.
          </p>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.userId}>
                  <TableCell className="font-mono text-xs">{u.userId}</TableCell>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.registrationDate}</TableCell>
                  <TableCell>{u.totalScans}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="default" type="button" disabled title="Wire to detail drawer">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        type="button"
                        onClick={() => del.mutate(u.userId)}
                        disabled={del.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end gap-2 text-sm">
            <Button variant="outline" size="sm" type="button" disabled>
              Previous
            </Button>
            <Button size="sm" type="button" disabled>
              1
            </Button>
            <Button variant="outline" size="sm" type="button" disabled>
              Next
            </Button>
            <span className="self-center text-xs text-muted-foreground">
              Pagination placeholders
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
