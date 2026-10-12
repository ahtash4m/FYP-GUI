import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { uploadScan } from "@/features/scans/scans.api"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, Cpu, Loader2, ScanFace } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function PatientProcessingPage() {
  const location = useLocation() as { state?: { file?: File; nonce?: string } }
  const navigate = useNavigate()
  const file = location.state?.file
  const nonce = location.state?.nonce ?? ""

  const pipelineStages = [
    { title: "Calibrating image quality", detail: "Optimizing resolution and lighting balance" },
    { title: "Analyzing dermal lesion patterns", detail: "Evaluating texture, erythema, and pore impactions" },
    { title: "Assessing clinical condition", detail: "Matching criteria against 8 recognized conditions" },
    { title: "Generating personalized OTC regimen", detail: "Mapping targeted active skincare ingredients" },
    { title: "Finalizing diagnostic report", detail: "Securing record to your private medical journal" },
  ]

  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(12)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const { mutate, isPending } = useMutation({
    mutationFn: (f: File) => uploadScan(f),
    onSuccess: (data) => {
      setProgress(100)
      navigate(`/app/results/${encodeURIComponent(data.scanId)}`, {
        replace: true,
        state: { result: data },
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
      navigate("/app/dashboard", { replace: true })
    },
  })

  useEffect(() => {
    if (!file || !nonce) {
      navigate("/app/dashboard", { replace: true })
      return
    }

    const onceKey = `acne-scan-mutate:${nonce}`
    if (!sessionStorage.getItem(onceKey)) {
      sessionStorage.setItem(onceKey, "1")
      mutate(file)
    }
  }, [file, nonce, mutate, navigate])

  useEffect(() => {
    if (isPending) {
      const progressId = window.setInterval(() => {
        setProgress((p) => Math.min(96, p + 3))
      }, 350)

      const statusId = window.setInterval(() => {
        setStatusIndex((curr) => Math.min(curr + 1, pipelineStages.length - 1))
      }, 1100)

      return () => {
        window.clearInterval(progressId)
        window.clearInterval(statusId)
      }
    }
  }, [isPending, pipelineStages.length])

  if (!file || !previewUrl) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 mt-4">
      {/* Header status */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <ScanFace className="h-7 w-7 animate-pulse" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Clinical Skin Analysis in Progress
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Our dermatological AI is evaluating dermal textures and preparing your personalized care routine.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-200/90 shadow-xl dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          {/* Laser scanning preview */}
          <div className="relative bg-slate-950 flex justify-center items-center h-[360px] overflow-hidden">
            <img
              src={previewUrl}
              alt="Analyzing Lesion"
              className="h-full w-full object-cover opacity-65 scale-105 filter contrast-125"
            />

            {/* Sweeping Cyan/Emerald Laser Scanner */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_4px_rgba(20,184,166,0.8)] animate-scan z-10" />

            {/* Biometric Target Bracket Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-52 h-52 border border-teal-500/30 rounded-2xl relative">
                {/* Corner markers */}
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr" />
                <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl" />
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br" />

                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 border border-teal-400/40 rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-mono text-teal-300 backdrop-blur-md flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 animate-spin" />
              <span>CLINICAL_ANALYSIS_ACTIVE</span>
            </div>
          </div>

          {/* Stepped progress indicators */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                  {pipelineStages[statusIndex].title}
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2.5 w-full bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Pipeline Stage Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {pipelineStages.slice(0, 4).map((stage, idx) => {
                const isDone = idx < statusIndex
                const isCurrent = idx === statusIndex

                return (
                  <div
                    key={stage.title}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? "bg-teal-50 border border-teal-200 text-teal-900 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-200"
                        : isDone
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600 opacity-60"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 text-teal-600 animate-spin shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span className="truncate">{stage.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}