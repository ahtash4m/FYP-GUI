import { cn } from "@/lib/utils"

interface CuraLogoProps {
  className?: string
  iconOnly?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  light?: boolean
}

export function CuraLogo({
  className,
  iconOnly = false,
  size = "md",
  light = false,
}: CuraLogoProps) {
  // Size metrics
  const dimensions = {
    sm: { icon: 24, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 34, text: "text-xl", sub: "text-[10px]" },
    lg: { icon: 44, text: "text-2xl", sub: "text-xs" },
    xl: { icon: 56, text: "text-3xl", sub: "text-sm" },
  }[size]

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Cura Vector Mark */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cura-c-grad" x1="15%" y1="90%" x2="85%" y2="10%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="45%" stopColor="#0D9488" />
            <stop offset="80%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="cura-cross-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <filter id="cura-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Curved 'C' Shape */}
        <path
          d="M 68 22 
             C 42 16, 20 32, 20 54 
             C 20 76, 42 88, 68 82 
             C 78 79, 82 72, 80 66 
             C 78 60, 70 59, 64 62 
             C 48 70, 36 62, 36 54 
             C 36 44, 46 32, 64 36 
             C 70 38, 77 34, 79 28 
             C 80 23, 75 19, 68 22 Z"
          fill="url(#cura-c-grad)"
        />

        {/* Medical Cross '+' inside */}
        {/* Horizontal bar */}
        <rect
          x="44"
          y="49"
          width="26"
          height="10"
          rx="5"
          fill="url(#cura-cross-grad)"
        />
        {/* Vertical bar */}
        <rect
          x="52"
          y="41"
          width="10"
          height="26"
          rx="5"
          fill="url(#cura-cross-grad)"
        />

        {/* Tech / Digital Circuit Node on the left */}
        <line
          x1="22"
          y1="54"
          x2="44"
          y2="54"
          stroke="#2DD4BF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle
          cx="22"
          cy="54"
          r="4.5"
          fill="#34D399"
          filter="url(#cura-glow)"
        />
        <circle
          cx="22"
          cy="54"
          r="2"
          fill="#FFFFFF"
        />
      </svg>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight font-sans",
              dimensions.text,
              light ? "text-white" : "text-slate-900 dark:text-white"
            )}
          >
            Cura
          </span>
          <span
            className={cn(
              "font-semibold tracking-[0.22em] uppercase transition-opacity",
              dimensions.sub,
              light ? "text-emerald-200" : "text-slate-500 dark:text-emerald-400"
            )}
          >
            AI Triage
          </span>
        </div>
      )}
    </div>
  )
}
