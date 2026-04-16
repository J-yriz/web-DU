'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function resolveSegmentLabel(pathname: string): string | null {
  if (pathname.endsWith('/edit')) return 'Editor'
  if (pathname.endsWith('/preview')) return 'Preview'
  if (pathname.endsWith('/assignments')) return 'Tugas'
  return null
}

export default function CourseDetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams<{ courseUid: string }>()
  const courseUid = Array.isArray(params.courseUid) ? params.courseUid[0] : params.courseUid

  const segmentLabel = resolveSegmentLabel(pathname)

  return (
    <div className="flex flex-col gap-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-4 pt-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <Link href="/mentor/courses" className="transition-colors hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="size-4 opacity-50" />
        <Link 
          href={`/mentor/courses/${courseUid}`} 
          className={cn(
            "transition-colors hover:text-foreground",
            !segmentLabel && "font-medium text-foreground"
          )}
        >
          Detail Kursus
        </Link>
        {segmentLabel && (
          <>
            <ChevronRight className="size-4 opacity-50" />
            <span className="font-medium text-foreground">{segmentLabel}</span>
          </>
        )}
      </nav>
      {children}
    </div>
  )
}
