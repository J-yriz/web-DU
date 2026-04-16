'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import { ArrowLeft, ClipboardList, FileCheck, Pencil, Plus, RefreshCw, Search, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { IMentorCourse, IMentorCourseAssignment, IMentorAssignmentSubmission } from '@/lib/types'
import { getCourseMeetingCount, getMentorCourseByUid } from '@/lib/mentorCourseStorage'
import {
  computeAssignmentStats,
  deleteMentorAssignment,
  filterSubmissions,
  getAssignmentsForCourse,
  getDeadlineUrgency,
  getEffectiveAssignmentStatus,
  getSubmissionsForCourse,
  type SubmissionFilterStatus,
} from '@/lib/mentorAssignmentsData'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { notifyDeleted, notifyError } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { SubmissionReviewDialog } from './SubmissionReviewDialog'
import { CourseAssignmentDialog } from './CourseAssignmentDialog'
import { ReviewSubmissionDateRange } from './ReviewSubmissionDateRange'

type MentorCourseAssignmentsClientProps = {
  courseUid: string
}

function assignmentLifecycleVariant(a: IMentorCourseAssignment, effectiveClosed: boolean): 'assignmentDraft' | 'assignmentPublished' | 'assignmentClosed' {
  if (a.status === 'draft') return 'assignmentDraft'
  if (effectiveClosed || a.status === 'closed') return 'assignmentClosed'
  return 'assignmentPublished'
}

function deadlineUrgencyVariant(urg: ReturnType<typeof getDeadlineUrgency>): 'deadlineOverdue' | 'deadlineDueSoon' | null {
  if (urg === 'closed') return null
  if (urg === 'overdue') return 'deadlineOverdue'
  if (urg === 'due_soon') return 'deadlineDueSoon'
  return null
}

function submissionReviewVariant(status: IMentorAssignmentSubmission['reviewStatus']): 'reviewPending' | 'reviewGraded' | 'reviewReturned' {
  switch (status) {
    case 'pending_review':
      return 'reviewPending'
    case 'graded':
      return 'reviewGraded'
    case 'returned':
      return 'reviewReturned'
  }
}

export function MentorCourseAssignmentsClient({ courseUid }: MentorCourseAssignmentsClientProps) {
  const confirm = useConfirm()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState<IMentorCourse | null | undefined>(undefined)
  const [assignments, setAssignments] = useState<IMentorCourseAssignment[]>([])
  const [submissions, setSubmissions] = useState<IMentorAssignmentSubmission[]>([])
  const [assignmentUid, setAssignmentUid] = useState<string | 'all'>('all')
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionFilterStatus>('all')
  const [submissionDateRange, setSubmissionDateRange] = useState<DateRange | undefined>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeSubmission, setActiveSubmission] = useState<IMentorAssignmentSubmission | null>(null)

  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false)
  const [assignmentFormMode, setAssignmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingAssignment, setEditingAssignment] = useState<IMentorCourseAssignment | null>(null)

  const refreshAssignments = useCallback(() => {
    setAssignments(getAssignmentsForCourse(courseUid))
  }, [courseUid])

  const refreshSubmissions = useCallback(() => {
    setSubmissions(getSubmissionsForCourse(courseUid))
  }, [courseUid])

  useEffect(() => {
    setCourse(getMentorCourseByUid(courseUid) ?? null)
  }, [courseUid])

  useEffect(() => {
    refreshAssignments()
    refreshSubmissions()
  }, [refreshAssignments, refreshSubmissions])

  useEffect(() => {
    if (!course) return
    if (searchParams.get('new') === '1') {
      setAssignmentFormMode('create')
      setEditingAssignment(null)
      setAssignmentFormOpen(true)
      router.replace(`/mentor/courses/${courseUid}/assignments`, { scroll: false })
    }
  }, [course, searchParams, router, courseUid])

  const now = useMemo(() => new Date(), [])
  const stats = useMemo(() => computeAssignmentStats(assignments, submissions, now), [assignments, submissions, now])

  const reviewDateFrom = useMemo(() => (submissionDateRange?.from ? format(submissionDateRange.from, 'yyyy-MM-dd') : undefined), [submissionDateRange])
  const reviewDateTo = useMemo(() => (submissionDateRange?.to ? format(submissionDateRange.to, 'yyyy-MM-dd') : undefined), [submissionDateRange])

  const filteredSubmissions = useMemo(
    () =>
      filterSubmissions(submissions, {
        assignmentUid,
        status: submissionStatus,
        from: reviewDateFrom,
        to: reviewDateTo,
      }),
    [submissions, assignmentUid, submissionStatus, reviewDateFrom, reviewDateTo],
  )

  const assignmentTitleMap = useMemo(() => {
    const m = new Map<string, string>()
    assignments.forEach((a) => m.set(a.uid, a.title))
    return m
  }, [assignments])

  const meetingMax = course ? getCourseMeetingCount(course) : 8

  const openReview = useCallback((s: IMentorAssignmentSubmission) => {
    setActiveSubmission(s)
    setReviewOpen(true)
  }, [])

  const onReviewSaved = useCallback((updated: IMentorAssignmentSubmission) => {
    setSubmissions((prev) => prev.map((x) => (x.uid === updated.uid ? updated : x)))
  }, [])

  const openCreate = useCallback(() => {
    setAssignmentFormMode('create')
    setEditingAssignment(null)
    setAssignmentFormOpen(true)
  }, [])

  const openEdit = useCallback((a: IMentorCourseAssignment) => {
    setAssignmentFormMode('edit')
    setEditingAssignment(a)
    setAssignmentFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (a: IMentorCourseAssignment) => {
      const ok = await confirm({
        title: 'Hapus tugas?',
        description: `Tugas "${a.title}" akan dihapus dari daftar.`,
        confirmLabel: 'Hapus',
        variant: 'destructive',
      })
      if (!ok) return
      if (deleteMentorAssignment(a.uid)) {
        notifyDeleted()
        refreshAssignments()
        refreshSubmissions()
        if (assignmentUid === a.uid) setAssignmentUid('all')
      } else {
        notifyError('Gagal menghapus tugas.')
      }
    },
    [confirm, refreshAssignments, refreshSubmissions, assignmentUid],
  )

  const onAssignmentFormSaved = useCallback(() => {
    refreshAssignments()
  }, [refreshAssignments])

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
        <p className="text-sm text-slate-600">Kursus tidak ditemukan.</p>
        <Button asChild variant="outline" className="w-fit rounded-xl shadow-none">
          <Link href="/mentor/courses">Kembali ke daftar</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back nav */}
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2 rounded-xl text-slate-500 hover:text-slate-900">
        <Link href={`/mentor/courses/${courseUid}`}>
          <ArrowLeft className="size-4 sm:size-[18px]" />
          <span className="text-xs sm:text-sm">Kembali ke kursus</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-12">
              <ClipboardList className="size-5 sm:size-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Kelola Tugas</h1>
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                {course.title} — {meetingMax} pertemuan
              </p>
            </div>
          </div>
          <Button type="button" size="sm" className="h-9 shrink-0 gap-2 rounded-xl text-xs font-semibold shadow-none sm:h-10 sm:text-sm" onClick={openCreate}>
            <Plus className="size-4 sm:size-[18px]" />
            Buat tugas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard variant="compact" className="shadow-xs" label="Tugas aktif" value={stats.activeAssignments} icon={<ClipboardList className="size-5" />} />
        <StatCard variant="compact" className="shadow-xs" label="Menunggu review" value={stats.awaitingReview} icon={<FileCheck className="size-5" />} />
        <StatCard variant="compact" className="shadow-xs" label="Mendekati tenggat" value={stats.dueSoonCount} icon={<Timer className="size-5" />} />
        <StatCard variant="compact" className="shadow-xs" label="Resubmit pending" value={stats.resubmitAwaitingReview} icon={<RefreshCw className="size-5" />} />
      </div>

      {/* Assignment CRUD table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
            <ClipboardList className="size-4 sm:size-[18px]" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">Daftar Tugas</h2>
            <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{assignments.length} tugas</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Judul</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Pertemuan</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Tenggat</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Status</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Kebijakan</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400 sm:text-sm">
                    Belum ada tugas. Klik Buat tugas untuk memulai.
                  </td>
                </tr>
              )}
              {assignments.map((a) => {
                const eff = getEffectiveAssignmentStatus(a, now)
                const urg = getDeadlineUrgency(a, now)
                const urgentVariant = deadlineUrgencyVariant(urg)
                return (
                  <tr
                    key={a.uid}
                    className={cn(
                      'border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50/40',
                      urg === 'due_soon' && 'border-l-2 border-l-amber-400 bg-amber-50/30',
                      urg === 'overdue' && 'border-l-2 border-l-rose-300 bg-rose-50/25',
                    )}>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-900 sm:text-sm">{a.title}</td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-slate-600 sm:text-sm">#{a.meetingNumber}</td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-slate-600 sm:text-sm">{format(new Date(a.deadlineAt), 'd MMM yyyy HH:mm', { locale: id })}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={assignmentLifecycleVariant(a, eff === 'closed')} />
                        {urgentVariant && <Badge variant={urgentVariant} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 sm:text-sm">
                      {a.autoCloseAfterDeadline ? 'Tutup otomatis' : '—'}
                      {a.allowResubmit ? ' · Resubmit' : ''}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 sm:size-9"
                          onClick={() => openEdit(a)}
                          aria-label={`Edit tugas: ${a.title}`}>
                          <Pencil className="size-3.5 sm:size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 sm:size-9"
                          onClick={() => handleDelete(a)}
                          aria-label={`Hapus tugas: ${a.title}`}>
                          <Trash2 className="size-3.5 sm:size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submissions */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">Kiriman Peserta</h2>
            <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">Filter dan review kiriman siswa</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Tugas</label>
            <select
              value={assignmentUid}
              onChange={(e) => setAssignmentUid(e.target.value === 'all' ? 'all' : e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-none outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 sm:h-11 sm:text-sm">
              <option value="all">Semua tugas</option>
              {assignments.map((a) => (
                <option key={a.uid} value={a.uid}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Status review</label>
            <select
              value={submissionStatus}
              onChange={(e) => setSubmissionStatus(e.target.value as SubmissionFilterStatus)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-none outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 sm:h-11 sm:text-sm">
              <option value="all">Semua</option>
              <option value="pending_review">Menunggu review</option>
              <option value="graded">Selesai dinilai</option>
              <option value="returned">Minta revisi</option>
            </select>
          </div>
          <ReviewSubmissionDateRange htmlForId="review-submission-date-range" value={submissionDateRange} onChange={setSubmissionDateRange} className="min-w-[220px] flex-1 lg:max-w-[280px]" />
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Siswa</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Tugas</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Dikirim</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Attempt</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Review</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]"> </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.uid} className="border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.studentAvatar} alt="" className="size-8 rounded-full object-cover sm:size-9" />
                      <span className="text-xs font-medium text-slate-900 sm:text-sm">{s.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 sm:text-sm">{assignmentTitleMap.get(s.assignmentUid) ?? '—'}</td>
                  <td className="px-4 py-3.5 text-xs tabular-nums text-slate-600 sm:text-sm">{format(new Date(s.submittedAt), 'd MMM yyyy', { locale: id })}</td>
                  <td className="px-4 py-3.5 text-xs tabular-nums text-slate-600 sm:text-sm">{s.attemptNumber}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={submissionReviewVariant(s.reviewStatus)} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-xl border-slate-200 text-[11px] font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900 sm:h-9 sm:text-xs"
                      onClick={() => openReview(s)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubmissions.length === 0 && <p className="py-10 text-center text-xs text-slate-400 sm:text-sm">Tidak ada kiriman untuk filter ini.</p>}
        </div>
      </div>

      <SubmissionReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        submission={activeSubmission}
        assignmentTitle={activeSubmission ? (assignmentTitleMap.get(activeSubmission.assignmentUid) ?? '—') : '—'}
        onSaved={onReviewSaved}
      />

      <CourseAssignmentDialog
        open={assignmentFormOpen}
        onOpenChange={setAssignmentFormOpen}
        course={course}
        courseUid={courseUid}
        mode={assignmentFormMode}
        editing={assignmentFormMode === 'edit' ? editingAssignment : null}
        onSaved={onAssignmentFormSaved}
      />
    </section>
  )
}
