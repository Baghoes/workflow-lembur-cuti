export type SubmissionStatus = "pending" | "approved" | "rejected"

export type SubmissionType = "lembur" | "cuti"

export type LeaveType = "Cuti Tahunan" | "Sakit" | "Alasan Penting"

export const LEAVE_TYPES: LeaveType[] = ["Cuti Tahunan", "Sakit", "Alasan Penting"]

export interface Submission {
  id: string
  type: SubmissionType
  employeeId: string
  whatsapp: string
  // Lembur: tanggal lembur. Cuti: tanggal mulai cuti.
  date: string
  // Lembur only
  startTime: string
  endTime: string
  durationHours: number | null
  // Cuti only
  leaveType?: LeaveType | ""
  endDate?: string
  totalDays?: number | null
  note: string
  status: SubmissionStatus
  rejectionNote?: string
  createdAt: number
}

export function calculateDurationHours(start: string, end: string): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  if ([sh, sm, eh, em].some(Number.isNaN)) return null

  let minutes = eh * 60 + em - (sh * 60 + sm)
  // Lembur bisa melewati tengah malam, tambahkan satu hari penuh.
  if (minutes <= 0) minutes += 24 * 60
  return minutes / 60
}

export function formatDuration(hours: number): string {
  return `${+hours.toFixed(2)} Jam`
}

export function calculateDays(start: string, end: string): number | null {
  if (!start || !end) return null
  const [sy, sm, sd] = start.split("-").map(Number)
  const [ey, em, ed] = end.split("-").map(Number)
  if ([sy, sm, sd, ey, em, ed].some(Number.isNaN)) return null

  const startDate = new Date(sy, sm - 1, sd)
  const endDate = new Date(ey, em - 1, ed)
  const diff = endDate.getTime() - startDate.getTime()
  if (diff < 0) return null
  // Inklusif: tanggal mulai dan selesai dihitung sebagai hari cuti.
  return Math.round(diff / (24 * 60 * 60 * 1000)) + 1
}

export function formatDays(days: number): string {
  return `${days} Hari`
}
