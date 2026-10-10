import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { uploadScan } from "@/features/scans/scans.api"
import { useMutation } from "@tanstack/react-query"
import { Loader2, ScanFace } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function PatientProcessingPage() {
  const location = useLocation() as { state?: { file?: File; nonce?: string } }
  const navigate = useNavigate()
  const file = location.state?.file
  const nonce = location.state?.nonce ?? ""

  const loadingStatuses = [
    "Initializing neural network...",
    "Extracting dermal features...",
    "Running MobileNetV2 inference...",
    "Mapping OTC treatment protocols...",
    "Finalizing results..."
  ]

  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(10)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Safely handle preview URL
  useEffect(() => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // Actual Backend Call
  const { mutate, isPending } = useMutation({
    mutationFn: (f: File) => uploadScan(f),
    onSuccess: (data) => {
      setProgress(100)
      // Navigate to your results page upon successful Flask response
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

  // Trigger mutation exactly once using your existing nonce logic
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

  // Manage Progress Bar and Text Animation while pending
  useEffect(() => {
    if (isPending) {
      // Slowly fill progress up to 95%
      const progressId = window.setInterval(() => {
        setProgress((p) => Math.min(95, p + 3))
      }, 400)

      // Rotate text every 1.2 seconds to simulate pipeline steps
      const statusId = window.setInterval(() => {
        setStatusIndex((current) => Math.min(current + 1, loadingStatuses.length - 1))
      }, 1200)

      return () => {
        window.clearInterval(progressId)
        window.clearInterval(statusId)
      }
    }
  }, [isPending, loadingStatuses.length])

  if (!file || !previewUrl) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 mt-8">
      <div className="text-center">
        <ScanFace className="mx-auto h-12 w-12 text-primary mb-4 animate-pulse" />
        <h1 className="text-2xl font-semibold tracking-tight">AI Analysis in Progress</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while our model analyzes your scan.
        </p>
      </div>

      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <CardContent className="p-0">
          <div className="relative bg-black flex justify-center items-center h-[400px]">
            {/* The base image, slightly dimmed */}
            <img 
              src={previewUrl} 
              alt="Processing Scan" 
              className="h-full w-full object-cover opacity-60"
            />
            
            {/* The sweeping laser scanner */}
            <div className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_3px_rgba(20,184,166,0.6)] animate-scan z-10"></div>
            
            {/* Centered crosshairs instead of a static box */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-48 h-48 border-2 border-primary/40 relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-card flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 text-primary font-medium">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{loadingStatuses[statusIndex]}</span>
            </div>
            
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <div className="flex justify-end">
                <span className="text-xs font-semibold text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}