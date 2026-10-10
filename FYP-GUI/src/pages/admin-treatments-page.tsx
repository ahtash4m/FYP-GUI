import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createTreatmentRule,
  deleteTreatmentRule,
  listTreatmentRules,
  updateTreatmentRule,
} from "@/features/admin/admin.api"
import type { TreatmentRuleRow } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function AdminTreatmentsPage() {
  const qc = useQueryClient()
  const list = useQuery({
    queryKey: ["admin", "treatments"],
    queryFn: listTreatmentRules,
  })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TreatmentRuleRow | null>(null)
  const [form, setForm] = useState({
    acneType: "",
    severity: "",
    recommendedTreatment: "",
  })

  function openCreate() {
    setEditing(null)
    setForm({ acneType: "", severity: "", recommendedTreatment: "" })
    setOpen(true)
  }

  function openEdit(row: TreatmentRuleRow) {
    setEditing(row)
    setForm({
      acneType: row.acneType,
      severity: row.severity,
      recommendedTreatment: row.recommendedTreatment,
    })
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateTreatmentRule({
          ...editing,
          acneType: form.acneType,
          severity: form.severity,
          recommendedTreatment: form.recommendedTreatment,
        })
      }
      return createTreatmentRule({
        acneType: form.acneType,
        severity: form.severity,
        recommendedTreatment: form.recommendedTreatment,
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "treatments"] })
      setOpen(false)
      toast.success("Treatment protocol saved successfully")
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Save failed"),
  })

  const del = useMutation({
    mutationFn: deleteTreatmentRule,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "treatments"] })
      toast.success("Treatment protocol deleted")
    },
  })

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Treatment Database</h1>
          <p className="text-sm text-muted-foreground">
            Configure clinical OTC routines dynamically mapped to AI predicted skin classes.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add New Treatment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OTC Recommendation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acne Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Recommended OTC Treatment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.acneType}</TableCell>
                  <TableCell>{r.severity}</TableCell>
                  <TableCell>{r.recommendedTreatment}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        type="button"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        type="button"
                        onClick={() => del.mutate(r.id)}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit treatment rule" : "New treatment rule"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="acneType">Acne type</Label>
              <Input
                id="acneType"
                value={form.acneType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acneType: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Input
                id="severity"
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, severity: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rx">Recommended OTC treatment</Label>
              <Input
                id="rx"
                value={form.recommendedTreatment}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recommendedTreatment: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => save.mutate()}
              disabled={
                save.isPending ||
                !form.acneType ||
                !form.severity ||
                !form.recommendedTreatment
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
