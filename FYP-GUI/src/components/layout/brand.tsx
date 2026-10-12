import { CuraLogo } from "@/components/layout/cura-logo"
import { cn } from "@/lib/utils"

interface BrandProps {
  className?: string
  iconOnly?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  light?: boolean
}

export function Brand({ className, iconOnly, size = "md", light }: BrandProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <CuraLogo iconOnly={iconOnly} size={size} light={light} />
    </div>
  )
}
