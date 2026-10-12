import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { listScans } from "@/features/scans/scans.api"
import { useAuth } from "@/providers/auth-provider"
import { useQuery } from "@tanstack/react-query"
import {
  Bell,
  Camera,
  Clock,
  Download,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const PREFERENCES_STORAGE_KEY = "cura_patient_preferences_v1"

export function PatientProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: listScans })

  // Profile Identity State
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isEditingName, setIsEditingName] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // App Triage Preferences State
  const [routineReminders, setRoutineReminders] = useState(true)
  const [cameraGridOverlay, setCameraGridOverlay] = useState(true)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.routineReminders === "boolean") setRoutineReminders(parsed.routineReminders)
        if (typeof parsed.cameraGridOverlay === "boolean") setCameraGridOverlay(parsed.cameraGridOverlay)
      }
    } catch {
      /* ignore storage read error */
    }
  }, [])

  // Keep displayName in sync when user changes
  useEffect(() => {
    if (user?.displayName && !isEditingName) {
      setDisplayName(user.displayName)
    }
  }, [user?.displayName, isEditingName])

  // Save Name Changes
  function handleSaveDisplayName(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty")
      return
    }
    updateUser({ displayName: displayName.trim() })
    setIsEditingName(false)
    toast.success("Name updated successfully")
  }

  // Save Triage Preferences
  function savePreferences(newReminders: boolean, newCamera: boolean) {
    setRoutineReminders(newReminders)
    setCameraGridOverlay(newCamera)
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ routineReminders: newReminders, cameraGridOverlay: newCamera })
    )
    toast.success("Preferences updated")
  }

  // Simulate Password Update
  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordModalOpen(false)
    toast.success("Account password changed successfully")
  }

  // Export Records as JSON
  function handleExportRecords() {
    const exportData = {
      patient: {
        id: user?.id,
        displayName: user?.displayName,
        email: user?.email,
        role: user?.role,
        exportedAt: new Date().toISOString(),
      },
      scansCount: scansQuery.data?.length ?? 0,
      scans: scansQuery.data ?? [],
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cura_health_record_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Health records exported successfully")
  }

  const scanCount = scansQuery.data?.length ?? 0

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. HERO IDENTITY CARD                                     */}
      {/* ========================================================= */}
      <Card className="rounded-3xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/90 shadow-lg ring-2 ring-emerald-400/30 shrink-0">
                <AvatarFallback className="bg-gradient-to-tr from-teal-800 to-emerald-700 text-white text-2xl font-extrabold">
                  {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "PT"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-white">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  {user?.displayName || "Patient User"}
                </h1>
                <p className="text-xs text-emerald-100 flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-emerald-200" />
                  <span>{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Badge className="bg-white/20 text-white backdrop-blur-md border-none text-xs font-semibold px-3 py-1 shadow-sm">
                Verified Patient
              </Badge>
              <Badge className="bg-emerald-500/80 text-white border-none text-xs font-semibold px-3 py-1 shadow-sm">
                Active Routine
              </Badge>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Completed Scans</span>
              <p className="text-xl font-extrabold">{scanCount}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Account Role</span>
              <p className="text-xl font-extrabold capitalize">{user?.role || "Patient"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Account Status</span>
              <p className="text-xl font-extrabold text-emerald-300">Active</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">Patient Record ID</span>
              <p className="text-sm font-mono font-bold mt-1">#{user?.id ? user.id.slice(-6) : "PT-001"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* 2. PERSONAL ACCOUNT SETTINGS                              */}
      {/* ========================================================= */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            <span>Account Details & Identity</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Update your public patient name and security credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Display Name Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </Label>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingName ? (
                <form onSubmit={handleSaveDisplayName} className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-9 h-10 rounded-xl text-xs font-medium focus-visible:ring-teal-600"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs px-3"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDisplayName(user?.displayName || "")
                      setIsEditingName(false)
                    }}
                    className="h-10 rounded-xl text-xs px-3"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <User className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user?.displayName || "Not specified"}
                  </span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    {user?.email}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0 ml-2">
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Password & Security Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-teal-600" />
                Account Security & Password
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regularly updating your password keeps your personal health records secure.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-slate-200 text-xs font-medium self-start sm:self-auto"
              onClick={() => setPasswordModalOpen(!passwordModalOpen)}
            >
              {passwordModalOpen ? "Close Password Form" : "Change Password"}
            </Button>
          </div>

          {/* Expandable Password Form */}
          {passwordModalOpen && (
            <form onSubmit={handlePasswordChange} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="h-9 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-9 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4"
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 3. APPLICATION & TRIAGE PREFERENCES                       */}
      {/* ========================================================= */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal-600" />
            <span>Triage Assistance Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>Daily Skincare Routine Checklist</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track morning and evening steps directly inside your skin analysis report.
              </p>
            </div>
            <Switch
              checked={routineReminders}
              onCheckedChange={(v) => savePreferences(v, cameraGridOverlay)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-teal-600" />
                <span>Camera Target Alignment Reticle</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displays clinical viewfinder brackets during live photo capture for optimal focus.
              </p>
            </div>
            <Switch
              checked={cameraGridOverlay}
              onCheckedChange={(v) => savePreferences(routineReminders, v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 4. PRIVACY, EXPORT & SESSION CONTROLS                     */}
      {/* ========================================================= */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Health Data Security & Session</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-900/40 dark:bg-teal-950/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                  Private Cloud Health Record
                </p>
                <p className="text-xs text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
                  Your facial photographs and skin diagnostic logs are isolated strictly to your
                  account identifier. Data is preserved securely with end-to-end encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 hover:bg-slate-50 dark:border-slate-800"
              onClick={handleExportRecords}
            >
              <Download className="h-3.5 w-3.5 text-teal-600" />
              <span>Download Health Records JSON</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
              onClick={async () => {
                await logout()
                navigate("/login", { replace: true })
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out of Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
