import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import {
  Camera,
  CheckCircle2,
  Focus,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Webcam from "react-webcam"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "./cropUtils"

export function PatientDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // App State
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload")
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
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    onDropRejected: () => toast.error("Please upload a standard image file (JPEG, PNG, or WEBP)."),
  })

  const captureWebcam = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot()
      if (image) {
        setImageSrc(image)
        toast.success("Snapshot captured successfully")
      }
    }
  }, [webcamRef])

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const resetSelection = () => {
    setImageSrc(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
  }

  async function analyze() {
    if (!imageSrc || !croppedAreaPixels) {
      toast.message("Please select and crop a photo first")
      return
    }

    try {
      setIsProcessing(true)
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels)

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ========================================================= */}
      {/* SECTION 1: HERO GREETING & CLINICAL TELEMETRY BANNER     */}
      {/* ========================================================= */}
      <div className="cura-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/50 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Cura Clinical Diagnostics Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Skin Triage & Analysis
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Welcome back, <span className="font-semibold text-teal-700 dark:text-teal-400">{user?.displayName || "Patient"}</span>.
              Capture or upload high-resolution facial skin photographs to evaluate skin lesions across 8 recognized dermatological conditions.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3.5 text-center shadow-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnostic Core</span>
              <span className="mt-1 block text-sm font-extrabold text-teal-700 dark:text-teal-300">Clinical AI</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">High Precision</span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3.5 text-center shadow-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Condition Coverage</span>
              <span className="mt-1 block text-sm font-extrabold text-teal-700 dark:text-teal-300">8 Conditions</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Full Spectrum</span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3.5 text-center shadow-sm col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Data</span>
              <span className="mt-1 block text-sm font-extrabold text-teal-700 dark:text-teal-300">Encrypted</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Private Cloud</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: INTERACTIVE TRIAGE WORKBENCH                   */}
      {/* ========================================================= */}
      <div className="cura-glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        {/* If NO image selected yet: Display Mode Switcher & Ingestion */}
        {!imageSrc ? (
          <div className="space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                    activeTab === "upload"
                      ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("camera")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                    activeTab === "camera"
                      ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Device Camera</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Private & Secure Session</span>
              </div>
            </div>

            {/* TAB 1: Smart Drag & Drop Zone */}
            {activeTab === "upload" && (
              <div
                {...getRootProps()}
                className={cn(
                  "group relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-teal-300/80 dark:border-teal-800/80 bg-gradient-to-b from-teal-50/40 via-white/50 to-slate-50/30 dark:from-slate-900/40 dark:via-slate-900/60 dark:to-teal-950/20 px-6 py-16 text-center transition-all duration-300 hover:border-teal-500 hover:bg-teal-50/60 dark:hover:border-teal-500",
                  isDragActive && "border-teal-500 bg-teal-100/50 dark:bg-teal-950/60 scale-[0.99]"
                )}
              >
                <input {...getInputProps()} />

                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-700/25 transition-transform duration-300 group-hover:scale-110">
                    <Upload className="h-9 w-9" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                    +
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    Drop your skin photograph here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a focused facial picture from your device. Supports standard high-resolution files.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="rounded-lg bg-white/90 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    JPEG / JPG
                  </span>
                  <span className="rounded-lg bg-white/90 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    PNG
                  </span>
                  <span className="rounded-lg bg-white/90 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    WEBP
                  </span>
                  <span className="text-xs text-slate-400">• Up to 15MB</span>
                </div>
              </div>
            )}

            {/* TAB 2: Live Camera Viewfinder */}
            {activeTab === "camera" && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black aspect-video sm:aspect-[4/3] shadow-2xl">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="h-full w-full object-cover"
                  />

                  {/* Clinical Target Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                    <div className="h-56 w-56 rounded-3xl border-2 border-white/50 border-dashed relative">
                      <div className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Medical Camera Feed</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-md shadow-teal-700/20 gap-2 text-sm"
                  onClick={captureWebcam}
                >
                  <Camera className="h-4 w-4" />
                  Capture Photo for Triage
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* STAGE 2: PRECISION LESION FRAMING & CROP WORKBENCH        */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Focus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Precision Lesion Focus Framing
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag the canvas to center lesions inside the square. Use zoom to isolate active acne formations.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 gap-1.5 shrink-0 self-start sm:self-center"
                onClick={resetSelection}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Change Image
              </Button>
            </div>

            {/* Darkroom Viewport */}
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-950 shadow-inner">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
              />
            </div>

            {/* Zoom Controls & Analysis CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <div className="flex items-center gap-3 w-full sm:w-72">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>

                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(vals) => setZoom(vals[0] ?? 1)}
                  className="w-full"
                />

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>

                <span className="w-12 text-right text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <Button
                className="w-full sm:w-auto sm:min-w-[240px] h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-700/25 transition-all gap-2"
                onClick={analyze}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing Skin Features...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Clinical Skin Triage →</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: CLINICAL PREPARATION BEST PRACTICES            */}
      {/* ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="cura-glass-card rounded-2xl p-4.5 space-y-1.5 transition-all hover:border-teal-400/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Optimal Diffused Lighting</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Face natural window light or a soft desk lamp. Harsh side illumination causes heavy shadows that obscure lesion depth.
          </p>
        </div>

        <div className="cura-glass-card rounded-2xl p-4.5 space-y-1.5 transition-all hover:border-teal-400/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Bare Skin Surface</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pull hair back from cheeks and forehead. Remove tinted sunscreen, foundation, or concealers before photographing.
          </p>
        </div>

        <div className="cura-glass-card rounded-2xl p-4.5 space-y-1.5 transition-all hover:border-teal-400/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Isolate Lesion Clusters</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Center active breakouts or redness in the square frame. Clear focus improves analysis accuracy.
          </p>
        </div>
      </div>
    </div>
  )
}