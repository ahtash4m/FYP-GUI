import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { uploadScan } from "@/features/scans/scans.api"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function PatientProcessingPage() {
  const location = useLocation() as { state?: { file?: File; nonce?: string } }
  const navigate = useNavigate()
  const file = location.state?.file
  const nonce = location.state?.nonce ?? ""

  const [statusLine, setStatusLine] = useState("Preparing image…")
  const [progress, setProgress] = useState(10)

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
            <img
              src={previewUrl}
              alt="Processing"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-lg border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(15,118,110,0.12)]" />
            </div>
          </div>
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
