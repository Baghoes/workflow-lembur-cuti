"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, Clock, CalendarRange, Loader2 } from "lucide-react"
import type { Submission, SubmissionType, LeaveType } from "@/lib/types"
import { calculateDurationHours, formatDuration, calculateDays, formatDays, LEAVE_TYPES } from "@/lib/types"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"

interface SubmissionFormProps {
  onSubmit: (submission: Submission) => void
}

const initialForm = {
  type: "lembur" as SubmissionType,
  employeeId: "",
  pin: "",
  whatsapp: "",
  date: "",
  startTime: "",
  endTime: "",
  leaveType: "" as LeaveType | "",
  endDate: "",
  note: "",
}

// Menggunakan API route lokal internal Next.js (bebas blokir CORS di HP)
const SCRIPT_URL = "/api/submit"

const fieldClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"

export function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState(1)
  const [showPin, setShowPin] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isLembur = form.type === "lembur"

  const steps = [
    { id: 1, label: "Verifikasi Akun" },
    { id: 2, label: isLembur ? "Rincian Lembur" : "Rincian Cuti" },
  ]

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const step1Valid =
    form.employeeId.trim().length > 0 && form.pin.trim().length > 0 && form.whatsapp.trim().length > 0

  const duration = calculateDurationHours(form.startTime, form.endTime)
  const days = calculateDays(form.date, form.endDate)

  const step2Valid = isLembur
    ? Boolean(form.date && form.startTime && form.endTime && form.note.trim())
    : Boolean(form.leaveType && form.date && form.endDate && days !== null && form.note.trim())

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!step2Valid || isLoading) return

    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const formattedWa = `62${form.whatsapp.replace(/^0+/, "")}`

    // Payload data yang dikirim ke /api/submit
    const payload = {
      id_finger: form.employeeId.trim(),
      pin: form.pin.trim(),
      whatsapp: formattedWa,
      tanggal: form.date,
      jam_mulai: isLembur ? form.startTime : "",
      jam_selesai: isLembur ? form.endTime : "",
      pekerjaan: isLembur ? form.note : `[CUTI: ${form.leaveType}] ${form.note}`,
      durasi: isLembur ? (duration ?? "") : (days ?? ""),
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.status === "success") {
        const generatedId = result.id_pengajuan || crypto.randomUUID()
        
        const base = {
          id: generatedId,
          type: form.type,
          employeeId: form.employeeId.trim(),
          whatsapp: `+${formattedWa}`,
          date: form.date,
          note: form.note,
          status: "pending" as const,
          createdAt: Date.now(),
        }

        if (isLembur) {
          onSubmit({
            ...base,
            startTime: form.startTime,
            endTime: form.endTime,
            durationHours: duration,
          })
        } else {
          onSubmit({
            ...base,
            startTime: "",
            endTime: "",
            durationHours: null,
            leaveType: form.leaveType,
            endDate: form.endDate,
            totalDays: days,
          })
        }

        setSuccessMsg(`Pengajuan berhasil terkirim! ID: ${generatedId} (${result.nama})`)
        setForm(initialForm)
        setStep(1)
        window.setTimeout(() => setSuccessMsg(null), 5000)
      } else {
        setErrorMsg(result.message || "Pengajuan gagal diproses.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setErrorMsg("Koneksi gagal. Periksa koneksi internet Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMsg}
        </div>
      )}

      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {steps.map((s, index) => {
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? <Check className="size-4" aria-hidden="true" /> : s.id}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-medium uppercase tracking-wide ${
                      isActive || isDone ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    Langkah {s.id}
                  </p>
                  <p
                    className={`truncate text-sm font-semibold ${
                      isActive || isDone ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full ${step > s.id ? "bg-emerald-500" : "bg-slate-200"}`} />
              )}
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-5">
          {/* Jenis pengajuan toggle */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-700">Jenis Pengajuan</span>
            <div
              role="tablist"
              aria-label="Jenis pengajuan"
              className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5"
            >
              {(
                [
                  { value: "lembur", label: "Lembur", icon: Clock },
                  { value: "cuti", label: "Cuti", icon: CalendarRange },
                ] as const
              ).map(({ value, label, icon: Icon }) => {
                const active = form.type === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => update("type", value)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition border ${
                      active
                        ? value === "lembur"
                          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                          : "bg-purple-50 text-purple-700 border-purple-200 shadow-sm"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </button>
                )
              })}
{/* Banner Tahap Pengembangan Cuti */}
          {!isLembur && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Clock className="size-4 text-amber-600" />
                <span>Fitur Pengajuan Cuti Sedang Disiapkan</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Modul integrasi cuti online sedang dalam tahap sinkronisasi dengan kebijakan HRD. Untuk sementara waktu, pengajuan cuti dapat dilakukan langsung ke bagian HRD.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700">
              ID Karyawan (ID Finger)
            </label>
            <input
              id="employeeId"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.employeeId}
              onChange={(e) => update("employeeId", e.target.value.replace(/\D/g, ""))}
              placeholder="Masukkan ID Finger Anda"
              className={fieldClasses}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
              PIN
            </label>
            <div className="relative">
              <input
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                value={form.pin}
                onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))}
                placeholder="Masukkan PIN Anda"
                className={`${fieldClasses} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
              >
                {showPin ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700">
              No. WhatsApp
            </label>
            <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-500">
                +62
              </span>
              <input
                id="whatsapp"
                inputMode="numeric"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value.replace(/\D/g, ""))}
                placeholder="81234567890"
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!step1Valid}
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lanjut ke Rincian
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {isLembur ? (
            <>
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                  Tanggal Lembur
                </label>
                <DatePicker id="date" value={form.date} onChange={(value) => update("date", value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">
                    Jam Mulai
                  </label>
                  <TimePicker id="startTime" value={form.startTime} onChange={(value) => update("startTime", value)} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">
                    Jam Selesai
                  </label>
                  <TimePicker id="endTime" value={form.endTime} onChange={(value) => update("endTime", value)} />
                </div>
              </div>

              {duration !== null && (
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <span className="text-sm font-medium text-blue-700">Estimasi Total Lembur</span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                  Uraian Tugas
                </label>
                <textarea
                  id="note"
                  rows={4}
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Jelaskan pekerjaan yang dikerjakan selama lembur..."
                  className={`${fieldClasses} resize-none`}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700">
                  Jenis Cuti
                </label>
                <select
                  id="leaveType"
                  value={form.leaveType}
                  onChange={(e) => update("leaveType", e.target.value as LeaveType)}
                  className={`${fieldClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22/%3E%3C/svg%3E')] bg-[length:1.15rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${form.leaveType ? "text-slate-900" : "text-slate-400"}`}
                >
                  <option value="" disabled>
                    Pilih jenis cuti
                  </option>
                  {LEAVE_TYPES.map((lt) => (
                    <option key={lt} value={lt} className="text-slate-900">
                      {lt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                    Tanggal Mulai
                  </label>
                  <DatePicker id="date" value={form.date} onChange={(value) => update("date", value)} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                    Tanggal Selesai
                  </label>
                  <DatePicker id="endDate" value={form.endDate} onChange={(value) => update("endDate", value)} />
                </div>
              </div>

              {days !== null && (
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <span className="text-sm font-medium text-blue-700">Estimasi Total Cuti</span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    {formatDays(days)}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                  Alasan Cuti
                </label>
                <textarea
                  id="note"
                  rows={4}
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Jelaskan alasan pengajuan cuti Anda..."
                  className={`${fieldClasses} resize-none`}
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={!step2Valid || isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim data...
                </>
              ) : (
                "Kirim Pengajuan"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
