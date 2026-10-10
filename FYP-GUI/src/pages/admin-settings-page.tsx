import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  getSystemSettings,
  requestBackupDownload,
  saveSystemSettings,
} from "@/features/admin/admin.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function AdminSettingsPage() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  })

  const [draft, setDraft] = useState({
    enableNewRegistrations: true,
    defaultLanguage: "English",
    confidenceThresholdPercent: 85,
  })

  useEffect(() => {
    if (q.data) {
      setDraft({
        enableNewRegistrations: q.data.enableNewRegistrations,
        defaultLanguage: q.data.defaultLanguage,
        confidenceThresholdPercent: q.data.confidenceThresholdPercent,
      })
    }
  }, [q.data])

  const save = useMutation({
    mutationFn: () => saveSystemSettings(draft),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] })
      toast.success("Settings saved successfully")
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Save failed"),
  })

  const backup = useMutation({
    mutationFn: requestBackupDownload,
    onSuccess: () => toast.success("Database backup generated successfully"),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Backup failed"),
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration for user registrations, clinical confidence thresholds, and backups.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Enable New Registrations</Label>
              <p className="text-xs text-muted-foreground">
                Backend should enforce this on register routes.
              </p>
            </div>
            <Switch
              checked={draft.enableNewRegistrations}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, enableNewRegistrations: v }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select
              value={draft.defaultLanguage}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, defaultLanguage: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Urdu">Urdu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Current Model Version</Label>
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              {q.data?.modelVersion ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Read-only from backend / model registry when available.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Confidence Threshold</Label>
              <span className="text-sm font-medium tabular-nums">
                {draft.confidenceThresholdPercent}%
              </span>
            </div>
            <Slider
              value={[draft.confidenceThresholdPercent]}
              max={100}
              step={1}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  confidenceThresholdPercent: v[0] ?? d.confidenceThresholdPercent,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Database &amp; Backup</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => backup.mutate()}
              disabled={backup.isPending}
            >
              Download Full Backup
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
