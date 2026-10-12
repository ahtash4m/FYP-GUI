import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Camera,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

export function PatientHelpPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
          <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
          Patient Knowledge Base
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Clinical Guidance & Capture Protocol
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          How to obtain high-precision triage scans and understand your condition.
        </p>
      </div>

      {/* Card 1: Capture Protocol */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Camera className="h-4 w-4 text-teal-600" />
            Standardized Photo Capture Protocol
          </CardTitle>
          <CardDescription className="text-xs">
            Follow these clinical imaging recommendations to maximize triage diagnostic accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Direct, Diffused Lighting
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use natural daytime illumination or face a soft lamp. Avoid heavy shadows from overhead lights.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Unobstructed Lesions
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pull hair away from the face and remove heavy cosmetics so epidermal textures are clearly visible.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Targeted Crop Area
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use the square crop viewfinder in Step 2 to isolate the primary breakout zone (cheeks, forehead, chin).
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Resolution & Sharpness
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensure the camera is focused and not blurry before capturing. Standard smartphone cameras work great.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Acne & Dermatological Classes */}
      <Card className="rounded-2xl border-slate-200/90 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Recognized Clinical Classifications
            </CardTitle>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold text-xs">
              8 Recognized Conditions
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Cura's clinical diagnostics system is calibrated to identify and triage 8 distinct cutaneous conditions:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {/* 1. Closed Comedones */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Closed Comedones</span>
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-none text-[10px]">
                Whiteheads
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Non-inflammatory follicular impactions covered by epidermal layers. Responsive to salicylic acid and gentle retinoid keratolytics.
            </p>
          </div>

          {/* 2. Open Comedones */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Open Comedones</span>
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-none text-[10px]">
                Blackheads
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dilated follicular openings containing oxidized sebum and keratin debris. Best managed with beta-hydroxy acids and non-comedogenic hydration.
            </p>
          </div>

          {/* 3. Pustular Acne */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Pustular Acne</span>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-none text-[10px]">
                Inflammatory
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Erythematous papules capped with visible purulent exudate. Targeted primarily with topical benzoyl peroxide and sulfur spot applications.
            </p>
          </div>

          {/* 4. Cystic Acne */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Cystic Acne</span>
              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-none text-[10px]">
                Severe / Deep
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Deep, tender inflammatory nodules and pseudocysts extending into lower dermal layers. High scarring propensity; professional dermatology consult advised.
            </p>
          </div>

          {/* 5. Hidradenitis Suppurativa */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Hidradenitis Suppurativa</span>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-none text-[10px]">
                Follicular Occlusive
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Chronic inflammatory condition characterized by recurrent painful nodules and sinus tracts. Requires specialized long-term medical care.
            </p>
          </div>

          {/* 6. Perioral Dermatitis */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Perioral Dermatitis</span>
              <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-none text-[10px]">
                Perioral Papules
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Clusters of small inflammatory micro-papules around the mouth and nasal folds. Often aggravated by heavy barrier creams or topical corticosteroids.
            </p>
          </div>

          {/* 7. Pigmentation */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Pigmentation (PIH)</span>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-none text-[10px]">
                Post-Inflammatory
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Residual dark spots and melanin concentration following healed active breakouts. Addressed with daily broad-spectrum SPF, niacinamide, and azelaic acid.
            </p>
          </div>

          {/* 8. Rosacea */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Rosacea</span>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-none text-[10px]">
                Vascular / Erythema
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Persistent central facial flushing, visible telangiectasia, and acneiform flare-ups. Managed with gentle anti-redness skincare and trigger avoidance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Scope & Boundaries */}
      <Card className="rounded-2xl border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            Safety Boundaries & Clinical Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-amber-900/90 dark:text-amber-300/90 space-y-2 leading-relaxed">
          <p>
            Cura is an AI-powered dermatological triage assistant designed to provide personalized over-the-counter
            skincare protocols. It is calibrated specifically for the 8 cutaneous and acneiform categories cataloged above. It does not
            diagnose unrelated dermatoses (e.g., eczema, psoriasis, fungal infections, or malignancies like melanoma),
            nor does it prescribe controlled antibiotics, oral retinoids, or isotretinoin.
          </p>
          <p className="font-semibold">
            Always seek in-person medical evaluation from a qualified physician or dermatologist if you
            experience severe discomfort, rapid lesion spreading, or adverse reactions to OTC topicals.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
