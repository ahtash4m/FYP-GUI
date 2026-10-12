import { Button } from "@/components/ui/button"
import { useTheme } from "@/providers/theme-provider"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "icon" | "pill"
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  if (variant === "pill") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className={cn(
          "h-9 px-3 gap-2 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all",
          className
        )}
      >
        {isDark ? (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-400 animate-pulse-glow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5 text-teal-700" />
            <span>Dark Mode</span>
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 transition-all duration-300",
        className
      )}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle visual theme"
    >
      <Sun
        className={cn(
          "h-4 w-4 text-amber-400 transition-all duration-300 absolute",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 text-slate-700 dark:text-slate-300 transition-all duration-300 absolute",
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
    </Button>
  )
}
