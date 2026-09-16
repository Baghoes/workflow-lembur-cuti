"use client"

import { useState } from "react"
import { SubmissionForm } from "@/components/submission-form"
import { ApprovalReview } from "@/components/approval-review"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"form" | "status">("form")

  return (
    <main className="min-h-screen bg-slate-100/60 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Form Pengajuan Lembur & Cuti
          </h1>
          <p className="text-sm text-slate-500">
            Butuh bantuan atau kendala mendesak? Hubungi HRD di{" "}
            <a href="https://wa.me/6281200000000" className="font-semibold text-blue-600 hover:underline">
              +62 812-0000-0000
            </a>
          </p>
        </header>

        {/* Tab Navigasi */}
        <div className="flex rounded-xl bg-white p-1.5 shadow-sm border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              activeTab === "form"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Form Pengajuan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              activeTab === "status"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Status Pengajuan
          </button>
        </div>

        {/* Konten Tab */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {activeTab === "form" ? (
            <SubmissionForm onSubmit={() => {}} />
          ) : (
            <ApprovalReview />
          )}
        </div>
      </div>
    </main>
  )
}
