import type {
  ActivityLogRow,
  AcneTypeStat,
  AdminStats,
  AdminUserRow,
  ScanListItem,
  ScanResult,
  SystemSettings,
  TreatmentRuleRow,
} from "@/types/api"

export const mockAdminStats: AdminStats = {
  totalUsers: 1250,
  scansToday: 45,
  pendingReviews: 12,
  systemStatus: "active",
}

export const mockAcneTypeStats: AcneTypeStat[] = [
  { type: "Comedonal", count: 450 },
  { type: "Pustular", count: 320 },
  { type: "Cystic", count: 180 },
]

export const mockActivityLog: ActivityLogRow[] = [
  {
    date: "2025-12-16",
    userId: "User_102",
    action: "Scan Completed",
    status: "Success",
  },
  {
    date: "2025-12-16",
    userId: "User_088",
    action: "Scan Completed",
    status: "Success",
  },
  {
    date: "2025-12-15",
    userId: "User_101",
    action: "Registration",
    status: "Success",
  },
]

export const mockAdminUsers: AdminUserRow[] = [
  {
    userId: "U001",
    fullName: "Alice Smith",
    email: "alice@email.com",
    registrationDate: "2024-01-15",
    totalScans: 12,
  },
  {
    userId: "U002",
    fullName: "Bob Jones",
    email: "bob@email.com",
    registrationDate: "2024-02-02",
    totalScans: 5,
  },
  {
    userId: "U003",
    fullName: "Charlie Brown",
    email: "charlie@email.com",
    registrationDate: "2024-03-10",
    totalScans: 8,
  },
]

export const mockTreatmentRules: TreatmentRuleRow[] = [
  {
    id: "t1",
    acneType: "Comedonal",
    severity: "Mild",
    recommendedTreatment: "Salicylic Acid Cleanser",
  },
  {
    id: "t2",
    acneType: "Pustular",
    severity: "Moderate",
    recommendedTreatment: "Benzoyl Peroxide Gel 5%",
  },
  {
    id: "t3",
    acneType: "Cystic",
    severity: "Severe",
    recommendedTreatment: "Consult Dermatologist",
  },
]

export const mockSystemSettings: SystemSettings = {
  enableNewRegistrations: true,
  defaultLanguage: "English",
  modelVersion: "v1.4.2-beta",
  confidenceThresholdPercent: 85,
}

export function mockScanResult(overrides?: Partial<ScanResult>): ScanResult {
  return {
    scanId: "scan_mock_1",
    predictedLabel: "Moderate Pustule Acne",
    confidencePercent: 92,
    description: "Pustules are inflamed, pus-filled bumps.",
    otcSteps: [
      { rank: 1, label: "Salicylic Acid Cleanser" },
      { rank: 2, label: "Oil-Free Moisturizer" },
      { rank: 3, label: "Benzoyl Peroxide Spot Treatment" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    highlightRegion: { x: 58, y: 42, width: 18, height: 14 },
    ...overrides,
  }
}

export const mockScanHistory: ScanListItem[] = [
  {
    scanId: "scan_101",
    createdAt: "2025-12-10T14:22:00",
    predictedLabel: "Mild Comedonal",
    confidencePercent: 88,
  },
  {
    scanId: "scan_099",
    createdAt: "2025-12-02T09:10:00",
    predictedLabel: "Moderate Pustular",
    confidencePercent: 91,
  },
]
