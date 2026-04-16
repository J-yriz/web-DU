'use client'

import { useEffect, useState } from 'react'
import { BookOpen, FileText, GripVertical, Plus } from 'lucide-react'
import type { ICourseModule } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type CourseModuleOutlineProps = {
  modules: ICourseModule[]
  activeModuleId: string | null
  activeLessonId: string | null
  onSelectModule: (moduleId: string) => void
  onSelectLesson: (moduleId: string, lessonId: string) => void
  onAddModule: () => void
  onRenameModule: (moduleId: string, title: string) => void
}

export function CourseModuleOutline({ modules, activeModuleId, activeLessonId, onSelectModule, onSelectLesson, onAddModule }: CourseModuleOutlineProps) {
  const [openModuleIds, setOpenModuleIds] = useState<string[]>([])

  useEffect(() => {
    if (!activeModuleId) return
    setOpenModuleIds((prev) => (prev.includes(activeModuleId) ? prev : [...prev, activeModuleId]))
  }, [activeModuleId])

  return (
    <aside className="rounded-2xl border border-slate-200/90 bg-white p-5 lg:sticky lg:top-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
          <BookOpen className="size-4 sm:size-[18px]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">Struktur Kursus</h3>
          <p className="text-[11px] font-medium text-slate-400 sm:text-xs">{modules.length} modul</p>
        </div>
      </div>

      <ScrollArea className="max-h-[calc(100vh-340px)]">
        <Accordion type="multiple" value={openModuleIds} onValueChange={setOpenModuleIds} className="flex flex-col gap-2.5">
          {modules.map((module, index) => {
            const isModuleActive = module.id === activeModuleId
            return (
              <AccordionItem
                key={module.id}
                value={module.id}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white px-0 transition-colors duration-150',
                  isModuleActive ? 'border-primary/15 bg-primary/2' : 'border-slate-200/90',
                )}>
                <AccordionTrigger
                  className="px-4 py-3.5 text-left no-underline hover:bg-slate-50/60 hover:no-underline"
                  onClick={() => onSelectModule(module.id)}>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums sm:size-8 sm:text-sm',
                        isModuleActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500',
                      )}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold leading-snug text-slate-900 sm:text-xs">{module.title}</span>
                      <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                        {module.lessons.length} lesson{module.lessons.length !== 1 && 's'}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2.5 pb-3 pt-0">
                  <div className="flex flex-col gap-1">
                    {module.lessons.map((lesson) => {
                      const isLessonActive = lesson.id === activeLessonId
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => onSelectLesson(module.id, lesson.id)}
                          className={cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
                            isLessonActive ? 'bg-primary/8 text-primary' : 'text-slate-600 hover:bg-slate-50',
                          )}>
                          <FileText className={cn('size-4 shrink-0 sm:size-[18px]', isLessonActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500')} />
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className={cn('truncate text-xs font-medium leading-snug sm:text-[13px]', isLessonActive && 'font-semibold')}>{lesson.title}</span>
                            <span className="text-[10px] font-medium capitalize text-slate-400 sm:text-[11px]">{lesson.type}</span>
                          </div>
                          <GripVertical className="ml-auto size-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 sm:size-4" />
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddModule}
        className="mt-4 h-9 w-full rounded-xl border-dashed border-slate-200 bg-white text-xs font-semibold text-slate-500 shadow-none hover:border-primary/30 hover:bg-slate-50 hover:text-primary sm:h-10 sm:text-sm">
        <Plus className="size-4 sm:size-[18px]" />
        Tambah Modul
      </Button>
    </aside>
  )
}
