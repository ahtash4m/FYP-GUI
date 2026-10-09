import imageCompression from "browser-image-compression"
import { getJson, postFormData } from "@/lib/api/client"
import { useMockApi } from "@/lib/api/config"
import {
  mockScanHistory,
  mockScanResult,
} from "@/mocks/fixtures"
import type { ScanListItem, ScanResult } from "@/types/api"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * POST /api/scans — Compresses image client-side, then uploads.
 */
export async function uploadScan(file: File): Promise<ScanResult> {
  if (useMockApi()) {
    await delay(1800)
    return mockScanResult({
      scanId: `scan_${Date.now()}`,
      imageUrl: URL.createObjectURL(file),
    })
  }

  // 1. Compress the image before sending it to Flask
  const options = {
    maxSizeMB: 1,             // Maximum file size in MB
    maxWidthOrHeight: 1024,   // Resize large images
    useWebWorker: true,
  }
  
  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed, falling back to original:", error);
  }

  // 2. Prepare FormData with the compressed file
  const fd = new FormData()
  fd.append("image", fileToUpload, file.name)
  
  return postFormData<ScanResult>("/api/scans", fd)
}

/** GET /api/scans/:scanId */
export async function getScan(scanId: string): Promise<ScanResult> {
  if (useMockApi()) {
    await delay(300)
    return mockScanResult({ scanId })
  }
  return getJson<ScanResult>(`/api/scans/${encodeURIComponent(scanId)}`)
}

/** GET /api/scans */
export async function listScans(): Promise<ScanListItem[]> {
  if (useMockApi()) {
    await delay(350)
    return mockScanHistory
  }
  return getJson<ScanListItem[]>("/api/scans")
}