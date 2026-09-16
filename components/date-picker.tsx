"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { CalendarDays } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const triggerClasses =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"

export function DatePicker({ id, value, onChange, placeholder = "Pilih tanggal" }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseValue(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger id={id} className={triggerClasses}>
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? format(selected, "EEEE, d MMMM yyyy", { locale: idLocale }) : placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-slate-200 bg-white p-0 text-slate-900 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">Pilih tanggal</span>
          <button
            type="button"
            onClick={() => {
              onChange(toValue(new Date()))
              setOpen(false)
            }}
            className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            Hari Ini
          </button>
        </div>
        <Calendar
          mode="single"
          locale={idLocale}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toValue(date))
              setOpen(false)
            }
          }}
          className="p-2"
        />
      </PopoverContent>
    </Popover>
  )
}
