'use client'

import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { DateRangePicker } from '@/components/ui/date-range-picker'

type ReviewSubmissionDateRangeProps = {
  htmlForId?: string
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  className?: string
}

export function ReviewSubmissionDateRange({ htmlForId, value, onChange, className }: ReviewSubmissionDateRangeProps) {
  return (
    <div className={cn('flex min-w-[200px] flex-col gap-1.5', className)}>
      <label htmlFor={htmlForId} className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
        Tanggal kirim
      </label>
      <DateRangePicker
        id={htmlForId}
        value={value}
        onChange={onChange}
        placeholder="Rentang tanggal kirim"
      />
    </div>
  )
}
