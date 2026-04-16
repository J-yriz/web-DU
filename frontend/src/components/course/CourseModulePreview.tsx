'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Check, Circle, Download, File, Link2, MapPin, Menu, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ICourseLesson, ICourseModule, ICourseModulesState, IMentorCourse } from '@/lib/types'
import { getMentorCourseByUid, getSessionCourseModules } from '@/lib/mentorCourseStorage'
import '@/styles/tiptap-editor.css'

export type CourseModulePreviewVariant = 'mentor' | 'student'

type CourseModulePreviewProps = {
  courseUid: string
  variant: CourseModulePreviewVariant
}

export function CourseModulePreview({ courseUid, variant }: CourseModulePreviewProps) {
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [modulesState, setModulesState] = useState<ICourseModulesState | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [openModules, setOpenModules] = useState<string[]>([])

  useEffect(() => {
    const foundCourse = getMentorCourseByUid(courseUid)
    const storedModules = getSessionCourseModules(courseUid)

    setCourse(foundCourse)
    setModulesState(storedModules)
    const firstModule = storedModules.modules[0]
    setActiveModuleId(firstModule?.id ?? null)
    setActiveLessonId(firstModule?.lessons[0]?.id ?? null)
    if (firstModule) setOpenModules([firstModule.id])
  }, [courseUid])

  const activeModule = useMemo<ICourseModule | null>(() => {
    if (!modulesState || !activeModuleId) return null
    return modulesState.modules.find((module) => module.id === activeModuleId) ?? null
  }, [modulesState, activeModuleId])

  const activeLesson = useMemo<ICourseLesson | null>(() => {
    if (!activeModule || !activeLessonId) return null
    return activeModule.lessons.find((lesson) => lesson.id === activeLessonId) ?? null
  }, [activeLessonId, activeModule])

  const isMediaOrEmbedContent = useMemo(() => {
    const contentHtml = activeLesson?.contentHtml ?? ''
    if (!contentHtml) return false

    return /<(img|iframe|video|embed|object)\b/i.test(contentHtml)
  }, [activeLesson?.contentHtml])

  if (course === undefined || !modulesState) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat preview kursus…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href={variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'}>{variant === 'mentor' ? 'Kembali ke kursus' : 'Kembali ke kursus saya'}</Link>
        </Button>
      </section>
    )
  }

  const backHref = variant === 'mentor' ? `/mentor/courses/${courseUid}` : '/student/learning'

  return (
    <section className="flex w-full flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12 ">
      <div className="flex flex-col gap-8">
        {variant === 'student' && (
          <Button asChild variant="ghost" size="sm" className="w-fit gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
        )}

        <div className="flex flex-col lg:flex-row gap-10 lg:items-start relative">
          {/* Course Navigation Sidebar */}
          <aside className={cn('lg:sticky lg:top-8 h-fit shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out', isSidebarOpen ? 'w-full lg:w-[300px]' : 'w-12')}>
            <div className={cn('rounded-2xl border border-border bg-card transition-all duration-300', isSidebarOpen ? 'p-5' : 'p-2')}>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="size-8 shrink-0 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground"
                  aria-label="Toggle sidebar">
                  <Menu className="size-4" />
                </Button>
                {isSidebarOpen && <span className="text-xs font-medium text-muted-foreground">Struktur Kursus</span>}
              </div>

              <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-in-out', isSidebarOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <div className="overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <Accordion type="multiple" value={openModules} onValueChange={setOpenModules} className="flex flex-col gap-2.5">
                      {modulesState.modules.map((module, index) => {
                        const isActiveModule = module.id === activeModuleId
                        const completedCount = module.lessons.filter((l) => l.isComplete).length
                        return (
                          <AccordionItem
                            key={module.id}
                            value={module.id}
                            className={cn(
                              'overflow-hidden rounded-2xl border bg-white px-0 transition-colors duration-150',
                              isActiveModule ? 'border-primary/15 bg-primary/2' : 'border-slate-200/90',
                            )}>
                            <AccordionTrigger className="px-4 py-3.5 text-left no-underline hover:bg-slate-50/60 hover:no-underline">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold leading-none text-slate-900 sm:text-xs">{module.title}</span>
                                <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                                  {module.lessons.length} lesson{module.lessons.length !== 1 && 's'} · {completedCount} selesai
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2.5 pb-3 pt-0">
                              <div className="flex flex-col gap-1">
                                {module.lessons.map((lesson) => {
                                  const isActiveLesson = lesson.id === activeLessonId
                                  return (
                                    <button
                                      key={lesson.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveModuleId(module.id)
                                        setActiveLessonId(lesson.id)
                                      }}
                                      className={cn(
                                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
                                        isActiveLesson ? 'bg-primary/8 text-primary' : 'text-slate-600 hover:bg-slate-50',
                                      )}>
                                      <span
                                        className={cn(
                                          'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors sm:size-6',
                                          lesson.isComplete
                                            ? 'bg-primary text-white'
                                            : isActiveLesson
                                              ? 'border-2 border-primary text-primary'
                                              : 'border-2 border-slate-300 text-transparent group-hover:border-slate-400',
                                        )}>
                                        {lesson.isComplete ? <Check className="size-3 sm:size-3.5" strokeWidth={3} /> : <Circle className="size-2 sm:size-2.5" />}
                                      </span>
                                      <span className={cn('text-xs font-medium leading-snug sm:text-[13px]', lesson.isComplete && !isActiveLesson && 'text-slate-400 line-through')}>
                                        {lesson.title}
                                      </span>
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

                  {variant === 'mentor' && activeModuleId && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-500 shadow-none hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:text-sm">
                        <Link href={`/mentor/courses/${courseUid}/edit?moduleId=${activeModuleId}`}>Edit modul ini</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Lesson Preview Content */}
          <div className="flex flex-1 flex-col gap-8 transition-all duration-500">
            <div className="overflow-hidden rounded-[2.5rem] p-8 md:p-12 ">
              <div className="flex flex-col gap-8">
                <div className="border-b border-border pb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{activeLesson?.title ?? 'Pilih lesson'}</h2>
                  {activeLesson?.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{activeLesson.description}</p>}
                </div>

                {!activeLesson ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <MonitorPlay className="size-16 text-slate-200" />
                    <p className="mt-6 text-sm font-semibold text-slate-400">Pilih lesson dari daftar untuk mulai pratinjau.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="tiptap-editor-root tiptap-preview min-h-[400px]">
                      <div
                        className={cn(
                          'ProseMirror text-lg leading-relaxed text-slate-700 font-sans',
                          isMediaOrEmbedContent ? 'bg-transparent! p-0! shadow-none! rounded-lg! border-none' : 'bg-white p-6 rounded-lg shadow-xs',
                        )}
                        dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml || '<p></p>' }}
                      />
                    </div>

                    {/* Supplemental Info */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Lesson Meta */}
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
                              <Calendar className="size-4 sm:size-[18px]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-slate-900 sm:text-sm">Detail Pelaksanaan</h4>
                              <p className="text-[10px] font-medium capitalize text-slate-400 sm:text-[11px]">{activeLesson.type}</p>
                            </div>
                          </div>
                          <Separator className="bg-slate-100" />
                          {activeLesson.type === 'online' && (
                            <div className="grid gap-4">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Video URL</span>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 text-sm sm:p-3.5">
                                  <MonitorPlay className="size-4 shrink-0 text-slate-400 sm:size-[18px]" />
                                  <span className="truncate text-xs font-medium text-slate-900 sm:text-sm">{activeLesson.videoUrl || '-'}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Meeting Link</span>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 text-sm sm:p-3.5">
                                  <Link2 className="size-4 shrink-0 text-slate-400 sm:size-[18px]" />
                                  <span className="truncate text-xs font-medium text-slate-900 sm:text-sm">{activeLesson.meetingLink || '-'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {activeLesson.type === 'offline' && (
                            <div className="grid gap-4">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Lokasi</span>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 text-sm sm:p-3.5">
                                  <MapPin className="size-4 shrink-0 text-slate-400 sm:size-[18px]" />
                                  <span className="truncate text-xs font-medium text-slate-900 sm:text-sm">{activeLesson.location || '-'}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Jadwal Sesi</span>
                                <span className="text-xs font-semibold text-slate-900 sm:text-sm">{activeLesson.scheduleNote || '-'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Embed Links */}
                      {!!activeLesson.embedLinks?.filter(Boolean).length && (
                        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
                          <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
                                <Link2 className="size-4 sm:size-[18px]" />
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-slate-900 sm:text-sm">Eksternal Resource</h4>
                                <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{activeLesson.embedLinks?.filter(Boolean).length} link</p>
                              </div>
                            </div>
                            <Separator className="bg-slate-100" />
                            <div className="flex flex-col gap-2.5">
                              {activeLesson.embedLinks?.filter(Boolean).map((link) => (
                                <a
                                  key={link}
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3 transition-colors duration-150 hover:bg-slate-50 sm:p-3.5">
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary sm:size-9">
                                    <Link2 className="size-4 sm:size-[18px]" />
                                  </span>
                                  <span className="truncate text-xs font-medium text-slate-900 group-hover:text-primary sm:text-sm">{link}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    {!!activeLesson.attachments?.length && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
                            <File className="size-4 sm:size-[18px]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900 sm:text-sm">Lampiran Berkas</h4>
                            <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{activeLesson.attachments.length} file</p>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {activeLesson.attachments.map((attachment) => {
                            const downloadable = Boolean(attachment.previewUrl)
                            const readableSize = `${Math.max(1, Math.round(attachment.size / 1024))} KB`
                            return (
                              <div key={attachment.id} className="group flex flex-col gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 transition-colors duration-150 hover:bg-slate-50/60">
                                {attachment.kind === 'image' && attachment.previewUrl ? (
                                  <AspectRatio ratio={16 / 10} className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={attachment.previewUrl} alt={attachment.name} className="h-full w-full object-cover" />
                                  </AspectRatio>
                                ) : (
                                  <div className="flex aspect-16/10 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                                    <File className="size-8 sm:size-10" />
                                  </div>
                                )}
                                <div className="flex flex-col gap-1 overflow-hidden">
                                  <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{attachment.name}</p>
                                  <p className="text-[10px] font-medium capitalize text-slate-400 sm:text-[11px]">
                                    {attachment.kind} · {readableSize}
                                  </p>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:text-sm"
                                  disabled={!downloadable}>
                                  {downloadable ? (
                                    <a href={attachment.previewUrl} download={attachment.name}>
                                      <Download className="size-4 sm:size-[18px]" />
                                      Download
                                    </a>
                                  ) : (
                                    <span>
                                      <File className="size-4 sm:size-[18px]" />
                                      Tidak tersedia
                                    </span>
                                  )}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
