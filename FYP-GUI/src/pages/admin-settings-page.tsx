import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Cpu,
  Database,
  Download,
  Globe,
  Save,
  Settings,
  Shield,
  Sliders,
  UserPlus,
} from "lucide-react"
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
      toast.success("System configurations updated successfully")
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Save failed"),
  })

  const backup = useMutation({
    mutationFn: requestBackupDownload,
    onSuccess: () => toast.success("MS SQL JSON backup downloaded successfully"),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Backup failed"),
  })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
          <Settings className="h-3.5 w-3.5 text-teal-600" />
          Global Configuration
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System & Model Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure security controls, clinical review thresholds, and data backup routines.
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-600" />
            Operational Parameters
          </CardTitle>
          <CardDescription className="text-xs">
            Changes are saved to <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">system_settings.json</code> and persist across server restarts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Setting 1: Registrations */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" />
                <Label className="text-xs font-bold text-slate-900 dark:text-white">
                  Allow Public Registrations
                </Label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When disabled, new patient sign-ups via <code className="font-mono">/api/auth/register</code> will be blocked.
              </p>
            </div>
            <Switch
              checked={draft.enableNewRegistrations}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, enableNewRegistrations: v }))
              }
            />
          </div>

          {/* Setting 2: Language */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-teal-600" />
              Primary System Locale
            </Label>
            <Select
              value={draft.defaultLanguage}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, defaultLanguage: v }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English (Default)</SelectItem>
                <SelectItem value="Urdu">Urdu (اردو)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setting 3: Model Version */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-teal-600" />
              Active AI Model Registry
            </Label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50 font-mono">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {q.data?.modelVersion ?? "MobileNetV2-FineTuned-T4"}
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                Inference Ready
              </Badge>
            </div>
          </div>

          {/* Setting 4: Clinical Review Threshold */}
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">
                    Clinical Triage Review Threshold
                  </Label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scans scoring below this value are flagged under "Pending Reviews" in Overview.
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {draft.confidenceThresholdPercent}%
              </span>
            </div>
            <Slider
              value={[draft.confidenceThresholdPercent]}
              max={100}
              min={50}
              step={1}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  confidenceThresholdPercent: v[0] ?? d.confidenceThresholdPercent,
                }))
              }
              className="py-2"
            />
          </div>

          {/* Setting 5: Database Backup */}
          <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-600" />
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Database Backup & Export
              </Label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates a timestamped JSON snapshot of all registered users, scan history, and treatment plans.
            </p>
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-300 text-xs font-semibold gap-1.5 hover:bg-white dark:hover:bg-slate-800"
                onClick={() => backup.mutate()}
                disabled={backup.isPending}
              >
                <Download className="h-3.5 w-3.5 text-teal-600" />
                {backup.isPending ? "Generating..." : "Download SQL JSON Snapshot"}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 px-6 py-4">
          <Button
            className="h-10 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-sm shadow-teal-700/20 gap-2"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            <Save className="h-4 w-4" />
            {save.isPending ? "Saving Changes..." : "Save System Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
