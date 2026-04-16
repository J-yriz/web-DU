'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User } from 'lucide-react'
import { CourseAttendanceData } from '@/lib/dummyData'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { ICourseAttendance } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function StudentAttendanceSection() {
  const attendanceRows = isMockDataEnabled() ? CourseAttendanceData : []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [permissionReason, setPermissionReason] = useState('')
  const [permissionDate, setPermissionDate] = useState('')
  const [activeCourseForModal, setActiveCourseForModal] = useState<ICourseAttendance | null>(null)

  const handleOpenModal = (course: ICourseAttendance, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setActiveCourseForModal(course)
    setPermissionDate('')
    setPermissionReason('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setActiveCourseForModal(null)
  }

  const handleSubmitPermission = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
    setActiveCourseForModal(null)
  }

  const handleHadir = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <section className="flex w-full flex-col gap-10 px-5 py-10 md:px-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Absensi Kelas</h1>
          <p className="text-sm font-medium text-slate-500">Pilih kelas untuk melihat detail absensi Anda atau lakukan presensi cepat.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {attendanceRows.map((course) => (
            <Link href={`/student/attendance/${course.courseId}`} key={course.courseId} className="group block">
              <Card className="h-full overflow-hidden transition-colors hover:border-slate-300">
                <div className="relative aspect-2/1 w-full border-b border-slate-100 bg-slate-50">
                  <Image src={course.image || 'https://picsum.photos/seed/placeholder/600/400'} alt={course.courseName} fill className="object-cover" />
                </div>

                <div className="flex h-full flex-col p-6">
                  <div className="mb-4">
                    <h3 className="mb-2 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">{course.courseName}</h3>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 line-clamp-1">
                      <User className="size-3.5" />
                      {course.author.name}
                    </p>
                  </div>

                  <div className="mt-auto flex  flex-col gap-5 border-t border-slate-100 pt-4">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Progres Kehadiran</span>
                        <span className="text-slate-800">{course.summary.progressPercentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${course.summary.progressPercentage}%` }} />
                      </div>
                    </div>

                    <div className="flex ans gap-2.5">
                      <Button type="button" variant="default" onClick={(e) => handleHadir(e)} className="flex-1">
                        Hadir
                      </Button>
                      <Button type="button" variant="secondary" onClick={(e) => handleOpenModal(course, e)} className="flex-1">
                        Ajukan Izin
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => (!open ? handleCloseModal() : setIsModalOpen(true))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mengajukan Izin</DialogTitle>
            <DialogDescription className="line-clamp-1">{activeCourseForModal?.courseName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPermission} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="permissionDate">Tanggal Izin</Label>
              <Input id="permissionDate" type="date" required value={permissionDate} onChange={(e) => setPermissionDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="permissionReason">Alasan Izin</Label>
              <Textarea id="permissionReason" required rows={4} placeholder="Ceritakan alasan Anda dengan jelas..." value={permissionReason} onChange={(e) => setPermissionReason(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button type="submit">Kirim Izin</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
