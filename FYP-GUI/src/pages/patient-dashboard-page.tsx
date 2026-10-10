import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Camera, Upload, X, Focus } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Webcam from "react-webcam"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "./cropUtils"

export function PatientDashboardPage() {
  const navigate = useNavigate()
  
  // App State
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  
  const webcamRef = useRef<Webcam>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setImageSrc(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: 1,
    onDropRejected: () => toast.error("Please upload a JPEG or PNG image."),
  })

  const captureWebcam = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot()
      if (image) {
        setImageSrc(image)
        setIsWebcamOpen(false)
      }
    }
  }, [webcamRef])

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const resetSelection = () => {
    setImageSrc(null)
    setIsWebcamOpen(false)
  }

  async function analyze() {
    if (!imageSrc || !croppedAreaPixels) {
      toast.message("Please select and crop a photo first")
      return
    }

    try {
      setIsProcessing(true)
      // Generate the cropped file
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)
      
      // Navigate to your existing processing route with the new cropped file
      navigate("/app/processing", {
        state: { file: croppedFile, nonce: crypto.randomUUID() },
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to crop image. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload or capture a clear facial photo and crop to the affected area for AI analysis.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          
          {/* STAGE 1: Selection (Dropzone or Camera Toggle) */}
          {!imageSrc && !isWebcamOpen && (
            <div className="flex flex-col gap-4">
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-6 py-12 text-center transition-colors",
                  isDragActive && "bg-primary/10"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold">Upload a photo of your face</p>
                  <p className="mt-1 text-sm text-muted-foreground">Drag & drop or Browse</p>
                </div>
              </div>
              
              <div className="relative flex items-center py-2">
                <div className="grow border-t border-muted"></div>
                <span className="shrink-0 px-2 text-xs text-muted-foreground uppercase">Or</span>
                <div className="grow border-t border-muted"></div>
              </div>

              <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => setIsWebcamOpen(true)}>
                <Camera className="h-5 w-5" />
                Take Photo with Camera
              </Button>
            </div>
          )}

          {/* STAGE 1.5: Live Webcam View */}
          {isWebcamOpen && (
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-lg border bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="w-full" onClick={() => setIsWebcamOpen(false)}>
                  Cancel
                </Button>
                <Button className="w-full gap-2" onClick={captureWebcam}>
                  <Camera className="h-4 w-4" /> Capture
                </Button>
              </div>
            </div>
          )}

          {/* STAGE 2: Cropper Interface */}
          {imageSrc && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Focus className="h-4 w-4" /> Zoom and drag to frame the affected area
                </p>
                <Button variant="ghost" size="icon" onClick={resetSelection}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={analyze} 
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Analyze Cropped Image"}
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}