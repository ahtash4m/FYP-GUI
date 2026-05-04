import { deleteJson, getJson, patchJson, postJson } from "@/lib/api/client"
import { useMockApi } from "@/lib/api/config"
import {
  mockAcneTypeStats,
  mockActivityLog,
  mockAdminStats,
  mockAdminUsers,
  mockSystemSettings,
  mockTreatmentRules,
} from "@/mocks/fixtures"
import type {
  AcneTypeStat,
  ActivityLogRow,
  AdminStats,
  AdminUserRow,
  SystemSettings,
  TreatmentRuleRow,
} from "@/types/api"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let treatmentStore = [...mockTreatmentRules]
let settingsStore: SystemSettings = { ...mockSystemSettings }

export async function getAdminStats(): Promise<AdminStats> {
  if (useMockApi()) {
    await delay(200)
    return mockAdminStats
  }
  return getJson<AdminStats>("/api/admin/stats")
}

export async function getAcneTypeStats(): Promise<AcneTypeStat[]> {
  if (useMockApi()) {
    await delay(200)
    return mockAcneTypeStats
  }
  return getJson<AcneTypeStat[]>("/api/admin/stats/acne-types?days=30")
}

export async function getActivityLog(): Promise<ActivityLogRow[]> {
  if (useMockApi()) {
    await delay(200)
    return mockActivityLog
  }
  return getJson<ActivityLogRow[]>("/api/admin/activity")
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  if (useMockApi()) {
    await delay(250)
    return mockAdminUsers
  }
  return getJson<AdminUserRow[]>("/api/admin/users")
}

export async function deleteAdminUser(userId: string): Promise<void> {
  if (useMockApi()) {
    await delay(200)
    return
  }
  await deleteJson(`/api/admin/users/${encodeURIComponent(userId)}`)
}

export async function listTreatmentRules(): Promise<TreatmentRuleRow[]> {
  if (useMockApi()) {
    await delay(200)
    return [...treatmentStore]
  }
  return getJson<TreatmentRuleRow[]>("/api/admin/treatments")
}

export async function createTreatmentRule(
  row: Omit<TreatmentRuleRow, "id">
): Promise<TreatmentRuleRow> {
  if (useMockApi()) {
    await delay(200)
    const created: TreatmentRuleRow = {
      ...row,
      id: `t_${Date.now()}`,
    }
    treatmentStore = [...treatmentStore, created]
    return created
  }
  return postJson<TreatmentRuleRow>("/api/admin/treatments", row)
}

export async function updateTreatmentRule(
  row: TreatmentRuleRow
): Promise<TreatmentRuleRow> {
  if (useMockApi()) {
    await delay(200)
    treatmentStore = treatmentStore.map((r) => (r.id === row.id ? row : r))
    return row
  }
  return patchJson<TreatmentRuleRow>(
    `/api/admin/treatments/${encodeURIComponent(row.id)}`,
    row
  )
}

export async function deleteTreatmentRule(id: string): Promise<void> {
  if (useMockApi()) {
    await delay(200)
    treatmentStore = treatmentStore.filter((r) => r.id !== id)
    return
  }
  await deleteJson(`/api/admin/treatments/${encodeURIComponent(id)}`)
}

export async function getSystemSettings(): Promise<SystemSettings> {
  if (useMockApi()) {
    await delay(150)
    return { ...settingsStore }
  }
  return getJson<SystemSettings>("/api/admin/settings")
}

export async function saveSystemSettings(
  patch: Partial<SystemSettings>
): Promise<SystemSettings> {
  if (useMockApi()) {
    await delay(300)
    settingsStore = { ...settingsStore, ...patch }
    return { ...settingsStore }
  }
  return patchJson<SystemSettings>("/api/admin/settings", patch)
}

/** GET /api/admin/backup — returns URL or triggers download per backend design. */
export async function requestBackupDownload(): Promise<void> {
  if (useMockApi()) {
    await delay(400)
    return
  }
  await getJson<unknown>("/api/admin/backup")
}
