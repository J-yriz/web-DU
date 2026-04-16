'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Save, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { ICourseLesson, ICourseModule, IMentorCourse } from '@/lib/types'
import { getMergedMentorCourses, getSessionCourseModules, getSessionCourseMeta, publishMentorCourse, setSessionCourseModules, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished, notifySaved } from '@/lib/notify'
import { CourseModuleOutline } from './CourseModuleOutline'
import { ModuleEditor } from './modules/ModuleEditor'

type CourseEditClientProps = {
  courseUid: string
  initialModuleId?: string
}

export function CourseEditClient({ courseUid, initialModuleId }: CourseEditClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [modules, setModules] = useState<ICourseModule[]>([])
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const createModuleId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return `module_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  }

  useEffect(() => {
    const merged = getMergedMentorCourses()
    const fromList = merged.find((c) => c.uid === courseUid)
    const session = getSessionCourseMeta(courseUid)
    const storedModules = getSessionCourseModules(courseUid)
    const selectedFromQuery = initialModuleId && storedModules.modules.some((module) => module.id === initialModuleId) ? initialModuleId : null
    const initialActiveModule = selectedFromQuery ?? storedModules.modules[0]?.id ?? null

    setModules(storedModules.modules)
    setActiveModuleId(initialActiveModule)

    if (fromList) {
      setCourse(fromList)
    } else if (session) {
      setCourse({
        uid: courseUid,
        title: session.title,
        header: session.header,
        description: session.header,
        image: session.image,
        published: session.published ?? false,
        moduleCount: 0,
        studentCount: 0,
        rating: 0,
        totalReviews: 0,
        updatedAt: 'Baru',
      })
    } else {
      setCourse(null)
    }
  }, [courseUid, initialModuleId])

  const handleSave = (opts?: { silent?: boolean; redirect?: boolean }) => {
    if (!modules.length) return
    setSessionCourseModules(courseUid, { version: 2, modules })
    if (!opts?.silent) notifySaved('Perubahan modul dan lesson berhasil disimpan.')
    if (opts?.redirect !== false) {
      router.push(`/mentor/courses/${courseUid}`)
      router.refresh()
    }
  }

  const handleSaveClick = async () => {
    const ok = await confirm({
      title: 'Simpan modul?',
      description: 'Perubahan modul dan lesson yang sedang diedit akan disimpan ke sesi lokal.',
      confirmLabel: 'Simpan',
    })
    if (!ok) return
    handleSave({ redirect: true })
  }

  const handlePublish = () => {
    handleSave({ silent: true, redirect: false })
    const moduleCount = Math.max(1, modules.length)
    if (course) {
      upsertExtraCourse({
        ...course,
        moduleCount,
        updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      })
      setCourse((prev) => (prev ? { ...prev, moduleCount } : prev))
    }
    publishMentorCourse(courseUid)
    notifyPublished()
    router.push(`/mentor/courses/${courseUid}`)
    router.refresh()
  }

  const handlePublishClick = async () => {
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan muncul di daftar kursus mentor.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    handlePublish()
  }

  const handleSelectModule = (targetModuleId: string) => {
    if (targetModuleId === activeModuleId && activeLessonId === null) return
    setActiveModuleId(targetModuleId)
    setActiveLessonId(null)
  }

  const handleSelectLesson = (targetModuleId: string, targetLessonId: string) => {
    setActiveModuleId(targetModuleId)
    setActiveLessonId(targetLessonId)
  }

  const handleAddModule = () => {
    const nextOrder = modules.length + 1
    const newModule: ICourseModule = {
      id: createModuleId(),
      title: `Modul ${nextOrder}`,
      order: nextOrder,
      maxLessons: 4,
      lessons: [
        {
          id: `lesson_${Date.now().toString(36)}`,
          title: 'Lesson 1',
          order: 1,
          type: 'online',
          description: '',
          contentHtml: '<p></p>',
          embedLinks: [],
          attachments: [],
          videoUrl: '',
          meetingLink: '',
        },
      ],
    }
    const nextModules = [...modules, newModule]
    setModules(nextModules)
    setActiveModuleId(newModule.id)
  }

  const handleRenameModule = (moduleId: string, title: string) => {
    setModules((prev) => prev.map((module) => (module.id === moduleId ? { ...module, title } : module)))
  }

  const activeModule = modules.find((module) => module.id === activeModuleId) ?? null

  const handleUpdateModule = (nextModule: ICourseModule) => {
    setModules((prev) => prev.map((entry) => (entry.id === nextModule.id ? nextModule : entry)))
  }

  const handleAddLesson = () => {
    if (!activeModule) return
    if (activeModule.lessons.length >= activeModule.maxLessons) return
    const nextOrder = activeModule.lessons.length + 1
    const nextModule: ICourseModule = {
      ...activeModule,
      lessons: [
        ...activeModule.lessons,
        {
          id: `lesson_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          title: `Lesson ${nextOrder}`,
          order: nextOrder,
          type: 'online',
          description: '',
          contentHtml: '<p></p>',
          embedLinks: [],
          attachments: [],
          videoUrl: '',
          meetingLink: '',
        },
      ],
    }
    handleUpdateModule(nextModule)
  }

  if (course === undefined) {
    return (
      <section className="flex flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-500">Memuat…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-600">Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau setelah membuat kursus baru.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back navigation */}
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2 rounded-xl text-slate-500 hover:text-slate-900">
        <Link href={`/mentor/courses/${courseUid}`}>
          <ArrowLeft className="size-4 sm:size-[18px]" />
          <span className="text-xs sm:text-sm">Kembali ke kursus</span>
        </Link>
      </Button>

      {/* Course header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-12">
              <Pencil className="size-5 sm:size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{course.title}</h1>
                <Badge variant={course.published ? 'mentorLive' : 'mentorDraft'} className="rounded-full px-2.5">
                  {course.published ? 'Aktif' : 'Draf'}
                </Badge>
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">{course.header}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {!course.published && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:text-sm"
                onClick={() => void handlePublishClick()}>
                <Upload className="size-4 sm:size-[18px]" />
                Publish
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold shadow-none sm:h-10 sm:text-sm"
              onClick={() => void handleSaveClick()}>
              <Save className="size-4 sm:size-[18px]" />
              Simpan
            </Button>
          </div>
        </div>
      </div>

      {/* Course image banner */}
      {course.image && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.image} alt="" className="max-h-48 w-full object-cover" />
        </div>
      )}

      {/* Editor + Outline grid */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
          <ModuleEditor module={activeModule} activeLessonId={activeLessonId} onUpdateModule={handleUpdateModule} onAddLesson={handleAddLesson} />

          <Separator className="my-6 bg-slate-100" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] italic text-slate-400 sm:text-xs">Semua perubahan disimpan ke sesi lokal setelah menekan Simpan.</p>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold shadow-none sm:h-10 sm:text-sm"
              onClick={() => void handleSaveClick()}>
              <Save className="size-4 sm:size-[18px]" />
              Simpan Perubahan
            </Button>
          </div>
        </div>

        <CourseModuleOutline
          modules={modules}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          onSelectModule={handleSelectModule}
          onSelectLesson={handleSelectLesson}
          onAddModule={handleAddModule}
          onRenameModule={handleRenameModule}
        />
      </div>
    </section>
  )
}
