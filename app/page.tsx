"use client"

import { useState } from "react"
import type { Submission } from "@/lib/types"
import { SubmissionForm } from "@/components/submission-form"
import { ApprovalReview } from "@/components/approval-review"

type Tab = "form" | "approval"

export default function Page() {
  const [tab, setTab] = useState<Tab>("form")
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const pendingCount = submissions.filter((s) => s.status === "pending").length

  function addSubmission(submission: Submission) {
    setSubmissions((prev) => [submission, ...prev])
  }

  function approve(id: string) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s)),
    )
  }

  function reject(id: string, note: string) {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "rejected", rejectionNote: note } : s,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Form Pengajuan Lembur
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Butuh bantuan atau kendala mendesak? Hubungi HRD di{" "}
            <a href="tel:+6281200000000" className="font-medium text-blue-600 hover:underline">
              +62 812-0000-0000
            </a>
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("form")}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "form"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Form Pengajuan
          </button>
          <button
            onClick={() => setTab("approval")}
            className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              tab === "approval"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Approval Review
            {pendingCount > 0 && (
              <span
                className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  tab === "approval" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {tab === "form" ? (
            <SubmissionForm onSubmit={addSubmission} />
          ) : (
            <ApprovalReview
              submissions={submissions}
              onApprove={approve}
              onReject={reject}
            />
          )}
        </section>
      </main>
    </div>
  )
}
