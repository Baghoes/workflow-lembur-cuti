"use client"

import { useState } from "react"
import { Clock } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

const triggerClasses =
  "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"

export function TimePicker({ id, value, onChange, placeholder = "Pilih jam" }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedHour, selectedMinute] = value ? value.split(":") : ["", ""]

  function commit(hour: string, minute: string) {
    if (hour && minute) {
      onChange(`${hour}:${minute}`)
      setOpen(false)
    }
  }

  const columnClasses =
    "flex max-h-52 flex-col overflow-y-auto scroll-smooth px-1 py-1 [scrollbar-width:thin]"
  const optionClasses = (active: boolean) =>
    `cursor-pointer rounded-md px-3 py-1.5 text-center text-sm transition ${
      active ? "bg-blue-600 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
    }`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger id={id} className={triggerClasses}>
        <span className={value ? "text-slate-900" : "text-slate-400"}>{value || placeholder}</span>
        <Clock className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto border-slate-200 bg-white p-0 text-slate-900 shadow-lg">
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div>
            <div className="border-b border-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-500">
              Jam
            </div>
            <div className={columnClasses}>
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => commit(hour, selectedMinute || "00")}
                  className={optionClasses(hour === selectedHour)}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="border-b border-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-500">
              Menit
            </div>
            <div className={columnClasses}>
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => commit(selectedHour || "00", minute)}
                  className={optionClasses(minute === selectedMinute)}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
