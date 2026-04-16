import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ICourseLessonOnline } from '@/lib/types'

type LessonTypeFieldsOnlineProps = {
  lesson: ICourseLessonOnline
  onChange: (next: ICourseLessonOnline) => void
}

export function LessonTypeFieldsOnline({ lesson, onChange }: LessonTypeFieldsOnlineProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="video-url" className="text-xs font-semibold text-slate-700 sm:text-sm">Link Video (YouTube/Vimeo)</Label>
        <Input
          id="video-url"
          type="url"
          value={lesson.videoUrl ?? ''}
          onChange={(event) => onChange({ ...lesson, videoUrl: event.target.value })}
          placeholder="https://youtube.com/..."
          className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meeting-link" className="text-xs font-semibold text-slate-700 sm:text-sm">Link Meeting (Zoom/Google Meet)</Label>
        <Input
          id="meeting-link"
          type="url"
          value={lesson.meetingLink ?? ''}
          onChange={(event) => onChange({ ...lesson, meetingLink: event.target.value })}
          placeholder="https://meet.google.com/..."
          className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
        />
      </div>
    </div>
  )
}
