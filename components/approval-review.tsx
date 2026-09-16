"use client"

import { useState } from "react"
import type { Submission } from "@/lib/types"
import { formatDuration, formatDays } from "@/lib/types"

interface ApprovalReviewProps {
  submissions: Submission[]
  onApprove: (id: string) => void
  onReject: (id: string, note: string) => void
}

const statusStyles: Record<Submission["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
}

const statusLabels: Record<Submission["status"], string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
}

function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function ApprovalReview({ submissions, onApprove, onReject }: ApprovalReviewProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-600">Belum ada pengajuan</p>
        <p className="mt-1 text-sm text-slate-400">
          Pengajuan lembur & cuti yang dikirim karyawan akan muncul di sini untuk ditinjau.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <ApprovalCard key={submission.id} submission={submission} onApprove={onApprove} onReject={onReject} />
      ))}
    </div>
  )
}

function ApprovalCard({
  submission,
  onApprove,
  onReject,
}: {
  submission: Submission
  onApprove: (id: string) => void
  onReject: (id: string, note: string) => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")

  const isPending = submission.status === "pending"
  const isLembur = submission.type === "lembur"
  const timeRange =
    submission.startTime && submission.endTime ? `${submission.startTime} - ${submission.endTime}` : "-"

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">ID Finger: {submission.employeeId}</h3>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                isLembur ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
              }`}
            >
              {isLembur ? "Lembur" : "Cuti"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">WhatsApp: {submission.whatsapp}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[submission.status]}`}
        >
          {statusLabels[submission.status]}
        </span>
      </div>

      {isLembur ? (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Tanggal</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{formatDate(submission.date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Rentang Jam</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{timeRange}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Estimasi Durasi</dt>
            <dd className="mt-0.5 font-semibold text-blue-600">
              {submission.durationHours !== null ? formatDuration(submission.durationHours) : "-"}
            </dd>
          </div>
        </dl>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Jenis Cuti</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{submission.leaveType || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Tanggal Mulai</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{formatDate(submission.date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Tanggal Selesai</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{formatDate(submission.endDate || "")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Total Cuti</dt>
            <dd className="mt-0.5 font-semibold text-blue-600">
              {submission.totalDays != null ? formatDays(submission.totalDays) : "-"}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-3 rounded-lg bg-slate-50 px-3.5 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {isLembur ? "Uraian Tugas" : "Alasan Cuti"}
        </p>
        <p className="mt-1 text-sm text-slate-700">{submission.note}</p>
      </div>

      {submission.status === "rejected" && submission.rejectionNote && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
          <p className="text-xs uppercase tracking-wide text-red-400">Catatan Penolakan</p>
          <p className="mt-1 text-sm text-red-700">{submission.rejectionNote}</p>
        </div>
      )}

      {isPending && !rejecting && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onApprove(submission.id)}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            Setujui
          </button>
          <button
            onClick={() => setRejecting(true)}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            Tolak
          </button>
        </div>
      )}

      {isPending && rejecting && (
        <div className="mt-5 space-y-3">
          <div className="space-y-2">
            <label htmlFor={`reject-${submission.id}`} className="block text-sm font-medium text-slate-700">
              Catatan Penolakan
            </label>
            <textarea
              id={`reject-${submission.id}`}
              rows={2}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Berikan alasan penolakan..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onReject(submission.id, note.trim())
                setRejecting(false)
                setNote("")
              }}
              disabled={note.trim().length === 0}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Konfirmasi Tolak
            </button>
            <button
              onClick={() => {
                setRejecting(false)
                setNote("")
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
