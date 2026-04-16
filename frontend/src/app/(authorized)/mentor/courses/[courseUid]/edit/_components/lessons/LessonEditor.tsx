'use client'

import dynamic from 'next/dynamic'
import { Download, File, Globe, Link2, Monitor, Paperclip, Plus, Text, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ICourseLesson, ICourseLessonOffline, ICourseLessonOnline } from '@/lib/types'
import { LessonTypeFieldsOffline } from './LessonTypeFieldsOffline'
import { LessonTypeFieldsOnline } from './LessonTypeFieldsOnline'

const TiptapRichTextEditor = dynamic(() => import('@/components/rich-text/TiptapRichTextEditor').then((module) => ({ default: module.TiptapRichTextEditor })), {
  ssr: false,
  loading: () => <div className="min-h-[220px] animate-pulse rounded-xl border border-slate-200 bg-slate-50/70" />,
})

type LessonEditorProps = {
  lesson: ICourseLesson
  onChange: (next: ICourseLesson) => void
}

function createAttachmentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `attachment_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function LessonEditor({ lesson, onChange }: LessonEditorProps) {
  const embedLinks = lesson.embedLinks ?? []
  const attachments = lesson.attachments ?? []

  return (
    <div className="flex flex-col gap-8 pb-6">
      {/* ── Basic Info ── */}
      <div className="space-y-5">
        <SectionHeading icon={<Text className="size-4 sm:size-[18px]" />} title="Informasi Dasar" />
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Judul Lesson" htmlFor="lesson-title">
              <Input
                id="lesson-title"
                value={lesson.title}
                onChange={(event) => onChange({ ...lesson, title: event.target.value })}
                placeholder="Masukkan judul lesson"
                className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
              />
            </FormField>
            <FormField label="Tipe Pelaksanaan" htmlFor="lesson-type">
              <Select
                value={lesson.type}
                onValueChange={(val) => {
                  if (val === 'offline') {
                    onChange({
                      id: lesson.id,
                      title: lesson.title,
                      order: lesson.order,
                      type: 'offline',
                      description: lesson.description,
                      contentHtml: lesson.contentHtml ?? '<p></p>',
                      embedLinks,
                      attachments,
                      location: '',
                      scheduleNote: '',
                    })
                  } else {
                    onChange({
                      id: lesson.id,
                      title: lesson.title,
                      order: lesson.order,
                      type: 'online',
                      description: lesson.description,
                      contentHtml: lesson.contentHtml ?? '<p></p>',
                      embedLinks,
                      attachments,
                      videoUrl: '',
                      meetingLink: '',
                    })
                  }
                }}>
                <SelectTrigger id="lesson-type" className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none sm:h-11">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-3.5 text-slate-500" />
                      <span>Online</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <Globe className="size-3.5 text-slate-500" />
                      <span>Offline</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Ringkasan" htmlFor="lesson-desc">
                <Textarea
                  id="lesson-desc"
                  rows={3}
                  value={lesson.description ?? ''}
                  onChange={(event) => onChange({ ...lesson, description: event.target.value })}
                  placeholder="Berikan gambaran singkat apa yang akan dipelajari di lesson ini..."
                  className="resize-none rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Editor ── */}
      <div className="space-y-5">
        <SectionHeading icon={<StepBadge step={1} />} title="Konten Pembelajaran" />
        <div className="overflow-hidden rounded-2xl ">
          <TiptapRichTextEditor
            initialContent={lesson.contentHtml ?? '<p></p>'}
            onChange={(html) => onChange({ ...lesson, contentHtml: html })}
            placeholder="Tulis konten lesson lengkap di sini. Gunakan heading, list, gambar, atau embed video."
          />
        </div>
      </div>

      {/* ── Specific Fields ── */}
      <div className="space-y-5">
        <SectionHeading icon={<StepBadge step={2} />} title={`Detail Pelaksanaan — ${lesson.type === 'online' ? 'Online' : 'Offline'}`} />
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
          {lesson.type === 'online' ? (
            <LessonTypeFieldsOnline lesson={lesson as ICourseLessonOnline} onChange={(next) => onChange(next)} />
          ) : (
            <LessonTypeFieldsOffline lesson={lesson as ICourseLessonOffline} onChange={(next) => onChange(next)} />
          )}
        </div>
      </div>

      {/* ── Media & Attachments ── */}
      <div className="space-y-5">
        <SectionHeading icon={<StepBadge step={3} />} title="Media & Lampiran" />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Embed Links */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
                <Link2 className="size-4 sm:size-[18px]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 sm:text-sm">Embed Links</h4>
                <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{embedLinks.length} link</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {embedLinks.map((link, index) => (
                <div key={`${lesson.id}_embed_${index}`} className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={link}
                    onChange={(event) => {
                      const next = [...embedLinks]
                      next[index] = event.target.value
                      onChange({ ...lesson, embedLinks: next })
                    }}
                    placeholder="https://youtube.com/..."
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-10 sm:text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-500 sm:size-9"
                    onClick={() => onChange({ ...lesson, embedLinks: embedLinks.filter((_, i) => i !== index) })}>
                    <span className="sr-only">Hapus</span>
                    <X className="size-3.5 sm:size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full rounded-xl border-dashed border-slate-200 text-[11px] font-semibold text-slate-500 shadow-none hover:border-primary/30 hover:bg-slate-50 hover:text-primary sm:h-10 sm:text-xs"
                onClick={() => onChange({ ...lesson, embedLinks: [...embedLinks, ''] })}>
                <Plus className="size-3.5 sm:size-4" />
                Tambah Link
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
                <Paperclip className="size-4 sm:size-[18px]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 sm:text-sm">File & Gambar</h4>
                <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">{attachments.length} lampiran</p>
              </div>
            </div>

            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="file" className="rounded-lg text-xs sm:text-sm">
                  File
                </TabsTrigger>
                <TabsTrigger value="image" className="rounded-lg text-xs sm:text-sm">
                  Gambar
                </TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="pt-3">
                <Input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    onChange({
                      ...lesson,
                      attachments: [...attachments, { id: createAttachmentId(), name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size, kind: 'file' }],
                    })
                    event.currentTarget.value = ''
                  }}
                  className="h-10 cursor-pointer rounded-xl border-slate-200 bg-white text-sm shadow-none sm:h-11"
                />
              </TabsContent>
              <TabsContent value="image" className="pt-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    onChange({
                      ...lesson,
                      attachments: [
                        ...attachments,
                        {
                          id: createAttachmentId(),
                          name: file.name,
                          mimeType: file.type || 'image/*',
                          size: file.size,
                          kind: 'image',
                          previewUrl: typeof URL !== 'undefined' ? URL.createObjectURL(file) : '',
                        },
                      ],
                    })
                    event.currentTarget.value = ''
                  }}
                  className="h-10 cursor-pointer rounded-xl border-slate-200 bg-white text-sm shadow-none sm:h-11"
                />
              </TabsContent>
            </Tabs>

            {attachments.length > 0 && (
              <>
                <Separator className="my-4 bg-slate-100" />
                <div className="flex flex-col gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-2.5 transition-colors duration-150 hover:bg-slate-50/60 sm:p-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 sm:size-9">
                          <File className="size-4 sm:size-[18px]" />
                        </span>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-xs font-medium text-slate-900 sm:text-[13px]">{attachment.name}</span>
                          <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                            {(attachment.size / 1024).toFixed(1)} KB · {attachment.kind}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {attachment.previewUrl && (
                          <Button asChild variant="ghost" size="icon" className="size-8 text-slate-500 hover:text-slate-900 sm:size-9">
                            <a href={attachment.previewUrl} download={attachment.name}>
                              <Download className="size-3.5 sm:size-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-500 sm:size-9"
                          onClick={() => onChange({ ...lesson, attachments: attachments.filter((entry) => entry.id !== attachment.id) })}>
                          <X className="size-3.5 sm:size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
    </div>
  )
}

function StepBadge({ step }: { step: number }) {
  return <span className="text-xs font-bold tabular-nums sm:text-sm">{step}</span>
}

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700 sm:text-sm">
        {label}
      </Label>
      {children}
    </div>
  )
}
