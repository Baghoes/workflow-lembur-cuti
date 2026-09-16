"use client"

import { useState } from "react"
import { Search, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9xRBuFYDzGipEKtGFmdaksQYzHLm50UpBG3Hguh7pQJUjNx2LAuj46y5pTAdZT_bDBA/exec"

interface StatusItem {
  id: string
  tanggal: string
  waktu: string
  pekerjaan: string
  status: string
  approvedBy?: string
}

export function ApprovalReview() {
  const [employeeId, setEmployeeId] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [dataList, setDataList] = useState<StatusItem[] | null>(null)

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeId || !pin) return

    setLoading(true)
    setErrorMsg(null)
    setDataList(null)

    try {
      const url = `${SCRIPT_URL}?action=check_status&id_finger=${encodeURIComponent(employeeId.trim())}&pin=${encodeURIComponent(pin.trim())}`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
      })
      
      const res = await response.json()

      if (res.status === "success") {
        setDataList(res.data)
      } else {
        setErrorMsg(res.message || "Data tidak ditemukan atau PIN salah.")
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Gagal menghubungi server Apps Script. Pastikan deployment berstatus Anyone.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase()
    if (s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="size-3.5" /> Disetujui
        </span>
      )
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          <XCircle className="size-3.5" /> Ditolak
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
        <Clock className="size-3.5" /> Menunggu
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheck} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <p className="text-xs text-slate-600 font-medium">
          Masukkan ID Finger dan PIN Anda untuk memantau status persetujuan pengajuan:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="ID Finger Anda"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN Anda"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !employeeId || !pin}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "Mencari data..." : "Lihat Status Pengajuan"}
        </button>
      </form>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {dataList && (
        <div className="space-y-3">
          {dataList.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">Belum ada riwayat pengajuan.</p>
          ) : (
            dataList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.id || "Pengajuan"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{item.tanggal}</span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="text-sm text-slate-800">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">Uraian Tugas / Alasan:</span>
                  <p className="text-slate-700 leading-relaxed">{item.pekerjaan}</p>
                </div>

                {item.waktu && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <Clock className="size-3.5 text-slate-400" />
                    <span>Waktu: {item.waktu}</span>
                  </div>
                )}

                {item.approvedBy && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                    Ditinjau oleh: <span className="font-medium text-slate-600">{item.approvedBy}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
