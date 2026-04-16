import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ICourseLessonOffline } from '@/lib/types'

type LessonTypeFieldsOfflineProps = {
  lesson: ICourseLessonOffline
  onChange: (next: ICourseLessonOffline) => void
}

export function LessonTypeFieldsOffline({ lesson, onChange }: LessonTypeFieldsOfflineProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="location" className="text-xs font-semibold text-slate-700 sm:text-sm">Lokasi / Ruangan</Label>
        <Input
          id="location"
          type="text"
          value={lesson.location ?? ''}
          onChange={(event) => onChange({ ...lesson, location: event.target.value })}
          placeholder="Contoh: Lab Multimedia"
          className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schedule-note" className="text-xs font-semibold text-slate-700 sm:text-sm">Catatan Jadwal</Label>
        <Input
          id="schedule-note"
          type="text"
          value={lesson.scheduleNote ?? ''}
          onChange={(event) => onChange({ ...lesson, scheduleNote: event.target.value })}
          placeholder="Contoh: Rabu, 09.00 - 11.00 WIB"
          className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
        />
      </div>
    </div>
  )
}
