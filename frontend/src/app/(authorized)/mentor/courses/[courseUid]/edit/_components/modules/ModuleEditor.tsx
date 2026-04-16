'use client'

import { FileText, Layers, Plus, Settings2 } from 'lucide-react'
import type { ICourseLesson, ICourseModule } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { LessonEditor } from '../lessons/LessonEditor'

type ModuleEditorProps = {
  module: ICourseModule | null
  activeLessonId: string | null
  onUpdateModule: (next: ICourseModule) => void
  onAddLesson: () => void
}

export function ModuleEditor({ module, activeLessonId, onUpdateModule, onAddLesson }: ModuleEditorProps) {
  if (!module) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 sm:size-14">
          <Settings2 className="size-6 sm:size-7" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900 sm:text-base">Tidak ada modul terpilih</h3>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">Pilih modul atau lesson dari sidebar untuk mulai mengelola konten.</p>
      </div>
    )
  }

  const activeLesson = module.lessons.find((l) => l.id === activeLessonId)

  if (activeLesson) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
            <FileText className="size-4 sm:size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">Edit Lesson</h2>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              <span className="font-medium text-slate-700">{module.title}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="font-medium text-slate-700">{activeLesson.title}</span>
            </p>
          </div>
        </div>

        <LessonEditor
          lesson={activeLesson}
          onChange={(nextLesson) => {
            const nextLessons: ICourseLesson[] = module.lessons.map((entry) => (entry.id === nextLesson.id ? nextLesson : entry))
            onUpdateModule({ ...module, lessons: nextLessons })
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
          <Layers className="size-4 sm:size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">Pengaturan Modul</h2>
          <p className="text-[11px] text-slate-500 sm:text-xs">Kelola informasi dasar modul dan daftar lesson di dalamnya.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="module-title" className="text-xs font-semibold text-slate-700 sm:text-sm">Nama Modul</Label>
          <Input
            id="module-title"
            value={module.title}
            onChange={(event) => onUpdateModule({ ...module, title: event.target.value })}
            placeholder="Contoh: Dasar-dasar Pemrograman"
            className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="module-max" className="text-xs font-semibold text-slate-700 sm:text-sm">Maksimum Lesson</Label>
          <Input
            id="module-max"
            type="number"
            min={1}
            value={module.maxLessons}
            onChange={(event) => onUpdateModule({ ...module, maxLessons: Math.max(1, Number(event.target.value) || 1) })}
            className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
          />
        </div>
      </div>

      <Separator className="bg-slate-100" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">Daftar Lesson</h3>
            <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{module.lessons.length} dari {module.maxLessons} lesson</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-xl border-dashed border-slate-200 text-[11px] font-semibold text-slate-500 shadow-none hover:border-primary/30 hover:bg-slate-50 hover:text-primary sm:h-9 sm:text-xs"
            onClick={onAddLesson}
            disabled={module.lessons.length >= module.maxLessons}>
            <Plus className="size-3.5 sm:size-4" />
            Tambah lesson
          </Button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {module.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 transition-colors duration-150 hover:bg-slate-50/60 sm:p-3.5">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums sm:size-9 sm:text-sm',
                  'bg-slate-100 text-slate-500',
                )}>
                {idx + 1}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium text-slate-900 sm:text-[13px]">{lesson.title}</p>
                <p className="text-[10px] font-medium capitalize text-slate-400 sm:text-[11px]">{lesson.type}</p>
              </div>
              <FileText className="size-4 shrink-0 text-slate-300 sm:size-[18px]" />
            </div>
          ))}
          {module.lessons.length === 0 && (
            <p className="col-span-full py-8 text-center text-xs italic text-slate-400 sm:text-sm">Belum ada lesson di modul ini.</p>
          )}
        </div>
      </div>
    </div>
  )
}
