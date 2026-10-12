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
  User,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await register(email, password, displayName)
      navigate("/app/dashboard", { replace: true })
      toast.success("Account created successfully. Welcome to Cura!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full bg-slate-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Left Clinical Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10">
          <Brand size="lg" light />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            Begin Your Skin Health Journey
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Personalized dermatological guidance starts here.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Create an account to keep track of your scans over time, receive tailored
            over-the-counter care routines, and observe condition changes.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Instant AI classification of comedones, papules, pustules, and cysts",
              "Structured OTC skincare routine recommendations",
              "Complete longitudinal scan history and timestamped progress",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800 pt-6">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
          <span>Clinical Triage Assistant • Professional Skincare Guidance</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-6">
            <Brand size="lg" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your Cura account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign up in seconds to start analyzing your skin health.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-teal-600 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-teal-600 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-teal-600 dark:border-slate-800"
                />
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md shadow-teal-700/20 transition-all duration-200 gap-2"
              type="submit"
              disabled={busy}
            >
              {busy ? "Registering…" : "Create Free Account"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
