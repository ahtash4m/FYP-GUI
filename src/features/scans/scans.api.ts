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
 * POST /api/scans — multipart field name must match Flask (e.g. "image").
 */
export async function uploadScan(file: File): Promise<ScanResult> {
  if (useMockApi()) {
    await delay(1800)
    return mockScanResult({
      scanId: `scan_${Date.now()}`,
      imageUrl: URL.createObjectURL(file),
    })
  }
  const fd = new FormData()
  fd.append("image", file)
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
