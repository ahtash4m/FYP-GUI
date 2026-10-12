import { Brand } from "@/components/layout/brand"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/auth-provider"
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }
  const from = location.state?.from?.pathname

  const [email, setEmail] = useState("patient@demo.local")
  const [password, setPassword] = useState("password")
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const u = await login(email, password)
      navigate(u.role === "admin" ? "/admin/overview" : from ?? "/app/dashboard", {
        replace: true,
      })
      toast.success("Welcome back to Cura")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  async function quickAdmin() {
    setBusy(true)
    try {
      await login("admin@test.com", "admin123", "admin")
      navigate("/admin/overview", { replace: true })
      toast.success("Signed in as Clinical Administrator")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  async function quickPatient() {
    setBusy(true)
    try {
      await login("patient@demo.local", "password", "patient")
      navigate("/app/dashboard", { replace: true })
      toast.success("Signed in as Demo Patient")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Left Clinical Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-12 text-white relative overflow-hidden">
        {/* Subtle decorative glow orbs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Brand size="lg" light />
        </div>

        {/* Hero Pitch */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Dermatology Triage
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Accurate, instantaneous skin triage at your fingertips.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Cura combines advanced computer vision diagnostics with certified
            over-the-counter clinical protocols to deliver actionable skincare guidance.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Multi-class facial skin condition assessment & lesion analysis",
              "Personalized, evidence-based OTC treatment guidance",
              "Private, end-to-end encrypted medical records",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Trust Indicator */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800 pt-6">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
          <span>Clinical Triage Assistant • Professional Skincare Guidance</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="lg:hidden flex justify-center mb-6">
            <Brand size="lg" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Cura
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your diagnostic scans and personalized treatment plans.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-teal-600 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-teal-600 dark:border-slate-800"
                />
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md shadow-teal-700/20 transition-all duration-200 gap-2"
              type="submit"
              disabled={busy}
            >
              {busy ? "Authenticating…" : "Sign In to Account"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {/* Quick Demo Logins for Pair Programming / Review */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center">
              <div className="grow border-t border-slate-200 dark:border-slate-800" />
              <span className="shrink-0 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Evaluation Access
              </span>
              <div className="grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 text-xs font-medium hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:hover:bg-slate-800"
                disabled={busy}
                onClick={quickPatient}
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5 text-teal-600" />
                Demo Patient
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 text-xs font-medium hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:hover:bg-slate-800"
                disabled={busy}
                onClick={quickAdmin}
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Demo Admin
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
