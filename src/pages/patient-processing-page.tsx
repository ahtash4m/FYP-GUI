import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { uploadScan } from "@/features/scans/scans.api"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function PatientProcessingPage() {
  const location = useLocation() as { state?: { file?: File; nonce?: string } }
  const navigate = useNavigate()
  const file = location.state?.file
  const nonce = location.state?.nonce ?? ""

  const [statusLine, setStatusLine] = useState("Preparing image…")
  const [progress, setProgress] = useState(10)
  
  // FIX: Use state for the URL instead of useMemo
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // FIX: Properly handle the creation and destruction of the URL in one effect
  useEffect(() => {
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const { mutate, isPending } = useMutation({
    mutationFn: (f: File) => uploadScan(f),
    onSuccess: (data) => {
      navigate(`/app/results/${encodeURIComponent(data.scanId)}`, {
        replace: true,
        state: { result: data },
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Scan failed")
      navigate("/app/dashboard", { replace: true })
    },
  })

  useEffect(() => {
    if (!file || !nonce) {
      navigate("/app/dashboard", { replace: true })
      return
    }
    const t1 = window.setTimeout(() => {
      setStatusLine("Analyzing texture…")
      setProgress(35)
    }, 400)
    const t2 = window.setTimeout(() => {
      setStatusLine("Extracting features…")
      setProgress(60)
    }, 900)
    const onceKey = `acne-scan-mutate:${nonce}`
    if (!sessionStorage.getItem(onceKey)) {
      sessionStorage.setItem(onceKey, "1")
      mutate(file)
    }
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [file, nonce, mutate, navigate])

  useEffect(() => {
    if (isPending) {
      const id = window.setInterval(() => {
        setProgress((p) => Math.min(95, p + 3))
      }, 400)
      return () => window.clearInterval(id)
    }
    return undefined
  }, [isPending])

  if (!file || !previewUrl) return null

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-4">
      <Card className="w-full overflow-hidden">
        <CardContent className="space-y-6 p-6">
          
          {/* THE UPDATED IMAGE PROCESSING CONTAINER */}
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border-2 border-muted bg-slate-100">
            {/* The base image with data-analysis styling */}
            <img
              src={previewUrl}
              alt="Processing Scan"
              className="h-full w-full object-cover grayscale blur-[2px] opacity-70"
            />
            
            {/* The AI scanning overlay effect */}
            <div className="absolute inset-0 bg-teal-500/20 animate-pulse mix-blend-overlay"></div>
            
            {/* Keep the central bounding box focus ring you already had */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-lg border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(15,118,110,0.12)]" />
            </div>
          </div>
          {/* END OF UPDATED CONTAINER */}

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>{statusLine}</p>
            <p className="text-xs">This animation is cosmetic; real timing depends on the Flask + GPU backend.</p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-center text-xs font-medium text-muted-foreground">
              {progress}%
            </p>
          </div>
          <Button className="w-full" disabled>
            Processing…
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}