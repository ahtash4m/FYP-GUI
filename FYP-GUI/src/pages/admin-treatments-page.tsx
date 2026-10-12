import { Badge } from "@/components/ui/badge"
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
import { Database, Pencil, Plus, Trash2 } from "lucide-react"
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Treatment Protocol Database
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold"
            >
              {list.data?.length ?? 0} Rules Active
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical protocols mapped in MS SQL Server and delivered dynamically to patients based on AI classification.
          </p>
        </div>

        <Button
          onClick={openCreate}
          size="sm"
          className="h-10 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-sm shadow-teal-700/20 gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Treatment Rule
        </Button>
      </div>

      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-600" />
            Configured OTC Mapping Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 pl-6">
                  Acne Classification
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  Severity Tier
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3">
                  Recommended OTC Treatment Protocol
                </TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-300 py-3 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data?.map((r) => (
                <TableRow
                  key={r.id}
                  className="border-b border-slate-100/80 hover:bg-teal-50/30 dark:border-slate-800/60 transition-colors text-xs"
                >
                  <TableCell className="py-3.5 pl-6 font-semibold text-slate-900 dark:text-white">
                    <Badge variant="outline" className="font-semibold text-xs border-teal-200 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:border-teal-900 dark:text-teal-300">
                      {r.acneType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    {r.severity}
                  </TableCell>
                  <TableCell className="py-3.5 text-slate-700 dark:text-slate-300 max-w-md leading-relaxed">
                    {r.recommendedTreatment}
                  </TableCell>
                  <TableCell className="text-right py-3.5 pr-6">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-slate-800"
                        type="button"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        type="button"
                        onClick={() => del.mutate(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editing ? "Modify Treatment Protocol" : "New Treatment Protocol Rule"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="acneType" className="text-xs font-semibold">Acne Classification</Label>
              <Input
                id="acneType"
                placeholder="e.g. Comedonal Acne"
                value={form.acneType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acneType: e.target.value }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="severity" className="text-xs font-semibold">Severity Tier</Label>
              <Input
                id="severity"
                placeholder="e.g. Mild or Moderate"
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, severity: e.target.value }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rx" className="text-xs font-semibold">Recommended OTC Skincare Steps</Label>
              <textarea
                id="rx"
                rows={4}
                placeholder="Sentences separated by periods: e.g. Wash twice daily with mild cleanser. Apply salicylic acid spot treatment."
                value={form.recommendedTreatment}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recommendedTreatment: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" type="button" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold"
              onClick={() => save.mutate()}
              disabled={
                save.isPending ||
                !form.acneType ||
                !form.severity ||
                !form.recommendedTreatment
              }
            >
              Save Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
