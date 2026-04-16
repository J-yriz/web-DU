'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Calendar, ClipboardList, Eye, Pencil, Star, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/card'
import type { IMentorCourse } from '@/lib/types'
import { getMentorCourseByUid, getSessionCourseModules, publishMentorCourse, upsertExtraCourse } from '@/lib/mentorCourseStorage'
import { countAssignmentsForCourse } from '@/lib/mentorAssignmentsData'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyPublished } from '@/lib/notify'

type CourseHubClientProps = {
  courseUid: string
}

export function CourseHubClient({ courseUid }: CourseHubClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [moduleCount, setModuleCount] = useState(0)
  const [lessonCount, setLessonCount] = useState(0)
  const [assignmentCount, setAssignmentCount] = useState(0)

  useEffect(() => {
    const load = () => {
      const found = getMentorCourseByUid(courseUid)
      setCourse(found)
      if (found) {
        const mods = getSessionCourseModules(courseUid)
        setModuleCount(mods.modules.length || found.moduleCount)
        setLessonCount(mods.modules.reduce((acc, module) => acc + module.lessons.length, 0))
        setAssignmentCount(countAssignmentsForCourse(courseUid))
      }
    }
    load()
    window.addEventListener('focus', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('focus', load)
      window.removeEventListener('storage', load)
    }
  }, [courseUid])

  const handlePublish = async () => {
    if (!course) return
    const ok = await confirm({
      title: 'Publikasikan kursus?',
      description: 'Kursus akan ditandai aktif dan bisa diakses peserta.',
      confirmLabel: 'Publish',
    })
    if (!ok) return
    upsertExtraCourse({
      ...course,
      moduleCount: Math.max(1, moduleCount),
      updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    publishMentorCourse(courseUid)
    notifyPublished()
    setCourse((prev) => (prev ? { ...prev, published: true } : prev))
    router.refresh()
  }

  if (course === undefined) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-sm text-slate-500">Memuat…</p>
      </section>
    )
  }

  if (course === null) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  const actions = [
    {
      icon: Pencil,
      label: 'Edit Konten',
      description: 'Buka editor modul dan lesson untuk mengelola materi kursus.',
      href: `/mentor/courses/${courseUid}/edit`,
    },
    {
      icon: Eye,
      label: 'Preview Materi',
      description: 'Lihat tampilan materi seperti yang dilihat peserta.',
      href: `/mentor/courses/${courseUid}/preview`,
    },
    {
      icon: ClipboardList,
      label: 'Kelola Tugas',
      description: 'Buat, sunting tugas, dan tinjau kiriman peserta.',
      href: `/mentor/courses/${courseUid}/assignments`,
    },
  ]

  return (
    <section className="flex w-full flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
          {course.image && (
            <div className="shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-xs">
              <Image src={course.image} alt="" className="aspect-video w-full object-cover md:h-32 md:w-56" width={224} height={126} />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={course.published ? 'mentorLive' : 'mentorDraft'} className="rounded-full px-2.5">
                  {course.published ? 'Aktif' : 'Draf'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{course.title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{course.header}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Star className="size-3 fill-current" />
                </div>
                <span className="text-sm font-semibold text-foreground">{course.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({course.totalReviews} ulasan)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                Terakhir update: {course.updatedAt}
              </div>
            </div>
          </div>

          {!course.published && (
            <Button type="button" size="lg" className="rounded-2xl px-8 font-semibold shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98]" onClick={() => void handlePublish()}>
              Publish Kursus
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Modul" value={moduleCount} icon={<BookOpen className="size-5" />} className="border-none bg-card shadow-xs" />
        <StatCard label="Total Lessons" value={lessonCount} icon={<ClipboardList className="size-5" />} className="border-none bg-card shadow-xs" />
        <StatCard label="Siswa Terdaftar" value={course.studentCount} icon={<Users className="size-5" />} className="border-none bg-card shadow-xs" />
        <StatCard label="Tugas Aktif" value={assignmentCount} icon={<ClipboardList className="size-5" />} className="border-none bg-card shadow-xs" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Kelola Kursus</h2>
          <p className="text-xs text-muted-foreground">Pilih aksi utama untuk mengelola materi dan tugas peserta.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors duration-150 hover:border-border hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                <action.icon className="size-4.5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-tight text-foreground">{action.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
