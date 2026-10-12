/** Matches future backend role values (SRS: Patient | Admin). */
export type UserRole = "patient" | "admin"

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export interface ScanHighlightRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface TreatmentStep {
  rank: number
  label: string
}

export interface ScanResult {
  scanId: string
  predictedLabel: string
  confidencePercent?: number
  description: string
  otcSteps: TreatmentStep[]
  imageUrl: string
  /** Optional overlay when backend returns detection boxes. */
  highlightRegion?: ScanHighlightRegion | null
}

export interface ScanListItem {
  scanId: string
  createdAt: string
  predictedLabel: string
  confidencePercent?: number
}

export interface AdminUserRow {
  userId: string
  fullName: string
  email: string
  registrationDate: string
  totalScans: number
}

export interface TreatmentRuleRow {
  id: string
  acneType: string
  severity: string
  recommendedTreatment: string
}

export interface AdminStats {
  totalUsers: number
  scansToday: number
  pendingReviews: number
  systemStatus: "active" | "degraded" | "down"
}

export interface AcneTypeStat {
  type: string
  count: number
}

export interface ActivityLogRow {
  date: string
  userId: string
  action: string
  status: string
}

export interface SystemSettings {
  enableNewRegistrations: boolean
  defaultLanguage: string
  modelVersion: string
  confidenceThresholdPercent: number
}
