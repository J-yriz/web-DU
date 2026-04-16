'use client'

import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DateRangePickerProps = {
  id?: string
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  placeholder?: string
  clearLabel?: string
  dateFormat?: string
  numberOfMonths?: 1 | 2
  align?: 'start' | 'center' | 'end'
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

function DateRangePicker({
  id,
  value,
  onChange,
  placeholder = 'Pilih rentang tanggal',
  clearLabel = 'Hapus filter',
  dateFormat = 'd MMM yyyy',
  numberOfMonths = 2,
  align = 'start',
  className,
  triggerClassName,
  disabled,
}: DateRangePickerProps) {
  const label = useMemo(() => {
    if (!value?.from) return placeholder
    const fromStr = format(value.from, dateFormat, { locale: localeId })
    if (!value.to || value.from.getTime() === value.to.getTime()) return fromStr
    return `${fromStr} — ${format(value.to, dateFormat, { locale: localeId })}`
  }, [value, placeholder, dateFormat])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-start gap-2 rounded-xl border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 shadow-none hover:bg-slate-50 sm:h-11 sm:text-sm',
            !value?.from && 'text-slate-400',
            className,
            triggerClassName,
          )}>
          <CalendarDays className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={numberOfMonths}
        />
        {value?.from && (
          <div className="flex justify-end border-t border-slate-100 px-3 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-900 sm:text-xs"
              onClick={() => onChange(undefined)}>
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
export type { DateRangePickerProps }
