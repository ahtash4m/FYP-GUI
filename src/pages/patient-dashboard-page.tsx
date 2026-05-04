import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Camera, Upload } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function PatientDashboardPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: 1,
    onDropRejected: () =>
      toast.error("Please upload a JPEG or PNG image."),
  })

  function analyze() {
    if (!file) {
      toast.message("Choose a photo first")
      return
    }
    navigate("/app/processing", {
      state: { file, nonce: crypto.randomUUID() },
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload a clear facial photo for AI-assisted triage (not a medical
          diagnosis).
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-6 py-12 text-center transition-colors",
              isDragActive && "bg-primary/10"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-semibold">
                Upload a clear photo of your face for analysis.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports JPEG/PNG. Ensure good lighting.
              </p>
            </div>
            <div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 shrink-0" />
              <span>
                Drag &amp; drop your image here or{" "}
                <span className="font-medium text-primary">Browse</span>
              </span>
            </div>
          </div>

          {preview ? (
            <div className="mt-4 overflow-hidden rounded-lg border">
              <img
                src={preview}
                alt="Selected preview"
                className="max-h-64 w-full object-cover"
              />
            </div>
          ) : null}

          <Button className="mt-6 w-full" size="lg" onClick={analyze} disabled={!file}>
            Analyze Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
