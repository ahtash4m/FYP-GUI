import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-5 w-5" aria-hidden />
      </div>
      <span>Acne Classification</span>
    </div>
  )
}
