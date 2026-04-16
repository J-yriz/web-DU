import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Users } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { ReactIcon } from './icons'
import { Badge, PaymentBadge } from './badge'
import { Rating } from './rating'
import { BadgeVariant, PaymentStatus } from '@/lib/types'
import { Profile } from './profile'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface CardProps {
  children?: React.ReactNode
  className?: string
  variant?: 'course' | 'resume' | 'transaction' | 'mentorCourse'
  image?: string
  title?: string
  description?: string
  variantBadge?: BadgeVariant
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  module?: string
  progress?: number
  // Transaction-specific props
  transactionId?: string
  classType?: string
  price?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  purchasedAt?: string
  detailHref?: string
  /** Variant `resume`: tautan tombol Lanjut / Lihat kursus */
  resumeDetailHref?: string
  /** Variant `mentorCourse`: subtitle di bawah judul */
  mentorHeader?: string
  mentorPublished?: boolean
  mentorModuleCount?: number
  mentorStudentCount?: number
  /** Tombol Draf / Terbitkan — dipanggil saat mentor mengubah status */
  mentorOnStatusClick?: () => void
  /** Tautan ke halaman tugas per kursus mentor */
  mentorAssignmentsHref?: string
}

const sizes = {
  container: {
    sm: 'w-full',
    md: 'w-full',
    lg: 'w-full',
  },
  imageWrapper: {
    sm: 'min-h-[160px]',
    md: 'min-h-[203px]',
    lg: 'min-h-[250px]',
  },
  contentWrapper: {
    sm: 'min-h-[160px] p-4 -mt-6',
    md: 'min-h-[208px] p-5 -mt-6',
    lg: 'min-h-[250px] p-6 -mt-8',
  },
  title: {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  },
  description: {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-lg',
  },
}

function Card({
  children,
  className,
  variant = 'course',
  image,
  title,
  description,
  variantBadge,
  author,
  rating,
  totalReviews,
  size = 'md',
  module,
  progress,
  transactionId,
  classType,
  price,
  paymentStatus,
  paymentMethod,
  purchasedAt,
  detailHref,
  resumeDetailHref,
  mentorHeader,
  mentorPublished,
  mentorModuleCount,
  mentorStudentCount,
  mentorOnStatusClick,
  mentorAssignmentsHref,
}: CardProps) {
  const safeTitle = title ?? 'Card'

  if (children) {
    return <div className={cn('rounded-2xl border border-border bg-card shadow-none', className)}>{children}</div>
  }

  if (variant === 'mentorCourse') {
    const isLive = mentorPublished === true
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-slate-300/90">
        <div className="relative aspect-16/10 w-full shrink-0">
          {image?.startsWith('data:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={safeTitle} className="h-full w-full object-cover" />
          ) : image ? (
            <Image src={image} alt={safeTitle} loading="lazy" fill className="object-cover" sizes="(max-width: 768px) 100vw, 384px" />
          ) : (
            <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-slate-100 text-slate-300">
              <ReactIcon />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant={isLive ? 'mentorLive' : 'mentorDraft'} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-900">{safeTitle}</h3>
            {mentorHeader && <p className="line-clamp-1 text-sm font-medium text-primary">{mentorHeader}</p>}
            {description && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="font-medium tabular-nums">{mentorModuleCount ?? 0}</span>
              <span className="text-slate-400">modul</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="font-medium tabular-nums">{mentorStudentCount ?? 0}</span>
              <span className="text-slate-400">siswa</span>
            </span>
            <div className="ml-auto shrink-0">
              <Rating rating={rating ?? 0} totalReviews={totalReviews ?? 0} />
            </div>
          </div>

          <div className={cn('mt-auto flex flex-wrap items-stretch gap-2 border-t border-slate-100 pt-4 sm:items-center sm:justify-end', mentorOnStatusClick && 'sm:justify-between')}>
            {mentorOnStatusClick ? (
              <Button
                type="button"
                variant={isLive ? 'outline' : 'default'}
                size="sm"
                className={cn('h-9 rounded-xl px-4 text-xs font-semibold shadow-none', isLive && 'border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100/90')}
                onClick={mentorOnStatusClick}>
                {isLive ? 'Jadikan draf' : 'Terbitkan'}
              </Button>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:ml-auto sm:justify-end">
              {mentorAssignmentsHref ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-900">
                  <Link href={mentorAssignmentsHref}>Tugas</Link>
                </Button>
              ) : null}
              {detailHref ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-900">
                  <Link href={detailHref}>Kelola kursus</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'transaction') {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white  sm:flex-row transition-all duration-300 hover:shadow-sm shadow-xs">
        {/* Left — Image */}
        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-52 md:w-80">
          {image ? (
            <Image src={image} alt={safeTitle} fill className="object-cover" sizes="(max-width: 640px) 100vw, 240px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
              <ReactIcon />
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          {/* Top row: Badge + Status */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {classType && <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{classType}</span>}
              {transactionId && <span className="text-xs font-medium text-slate-400">{transactionId}</span>}
            </div>
            {paymentStatus && <PaymentBadge status={paymentStatus} />}
          </div>

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900 md:text-lg">{safeTitle}</h3>

          {/* Meta info row */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
            {paymentMethod && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-slate-400">Via</span> {paymentMethod}
              </span>
            )}
            {purchasedAt && <span>{purchasedAt}</span>}
          </div>

          {/* Bottom row: Price + Action */}
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            {price && <span className="text-lg font-bold tracking-tight text-slate-900">{price}</span>}
            {detailHref && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900">
                <Link href={detailHref}>Lihat Detail</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'resume') {
    return (
      <div className="flex shadow-xs h-full w-full flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white  hover:shadow-sm">
        {/* Image Content */}
        <div className="relative aspect-video w-full shrink-0 rounded-[10px] min-h-[203px]">
          {image ? (
            <Image src={image} alt={safeTitle} loading="lazy" fill className="rounded-[10px] object-cover" sizes="(max-width: 768px) 100vw, 384px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
              <ReactIcon />
            </div>
          )}
        </div>

        {/* Content description */}
        <div className="relative z-10 -mt-6 flex grow flex-col rounded-xl bg-white p-5">
          {/* Top Info (Badge & Rating) */}
          {(variantBadge || rating !== undefined) && (
            <div className="mb-3 flex items-center justify-between">
              {variantBadge && <Badge variant={variantBadge} />}
              {rating !== undefined && totalReviews !== undefined && <Rating rating={rating} totalReviews={totalReviews} />}
            </div>
          )}

          <div className="mb-4 flex flex-col">
            <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-snug text-slate-900">{safeTitle}</h3>
            {module && <p className="mb-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">{module}</p>}

            {description && <p className="line-clamp-2 text-sm leading-[1.4] font-normal text-slate-500">{description}</p>}
          </div>

          {/* Progress */}
          {progress !== undefined && (
            <div className="mt-auto mb-5 w-full">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Progres Belajar</span>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Bottom Section (Author & Action) */}
          {author && (
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
              <Profile image={author.avatar ?? '/pinguin.png'} name={author.name ?? ''} />
              {progress === 100 ? (
                <Badge variant="progressComplete" />
              ) : resumeDetailHref ? (
                <Button asChild className="px-5 py-2 text-sm font-semibold rounded-lg shadow-none" variant="default" size="sm">
                  <Link href={resumeDetailHref}>Lanjut</Link>
                </Button>
              ) : (
                <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-none" variant="default" size="sm">
                  Lanjut
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full w-full ${sizes.container[size]} flex-col overflow-hidden drop-shadow-sm transition-all hover:drop-shadow-md duration-300`}>
      {/* Image Content*/}
      <div className={`relative aspect-video w-full shrink-0 rounded-[10px] ${sizes.imageWrapper[size]}`}>
        {image ? (
          <Image src={image} alt={safeTitle} loading="lazy" fill className="rounded-[10px] object-cover" sizes="(max-width: 768px) 100vw, 384px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* Content description */}
      <div className={`relative z-10 flex grow flex-col rounded-xl bg-white border border-slate-100/50 ${sizes.contentWrapper[size]}`}>
        {/* Top Info (Badge & Rating) */}
        {(variantBadge || rating !== undefined) && (
          <div className="mb-3 flex items-center justify-between">
            {variantBadge && <Badge variant={variantBadge} />}
            {rating !== undefined && totalReviews !== undefined && <Rating rating={rating} totalReviews={totalReviews} />}
          </div>
        )}

        <div className="mb-5 flex flex-col w-full">
          <h3 className={`mb-1.5 line-clamp-2 leading-snug font-bold text-slate-900 ${sizes.title[size]}`}>{safeTitle}</h3>
          {module && <p className="mb-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">{module}</p>}

          {description && <p className={`line-clamp-2 grow leading-[1.4] font-normal text-slate-500 ${sizes.description[size]}`}>{description}</p>}
        </div>

        {/* Bottom Section (Author & Action) */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          {author ? <Profile image={author.avatar ?? '/pinguin.png'} name={author.name ?? ''} /> : <div />}

          {progress === 100 ? (
            <Badge variant="progressComplete" />
          ) : (
            <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
              Mulai
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Panel permukaan standar (section berborder) — dipakai ulang di dashboard mentor, hub, dll. */
export const CARD_PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'

export function CardPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn(CARD_PANEL_CLASS, 'p-5', className)} {...props} />
}

const statCardShellVariants = cva('rounded-2xl border border-slate-100 bg-white flex items-center justify-between', {
  variants: {
    variant: {
      default: 'w-72 h-32 p-6 mt-5',
      compact: 'p-6 shadow-2xs',
      legacy: 'w-72 h-32 p-6 mt-5 border-gray-400',
    },
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type StatCardProps = {
  title?: string
  label?: string
  value: string | number
  icon?: ReactNode
  themeIcon?: string
  colorClass?: string
  bgClass?: string
  className?: string
} & VariantProps<typeof statCardShellVariants>

export function StatCard({ title, label, value, icon, themeIcon, variant, size, colorClass, bgClass, className }: StatCardProps) {
  const displayLabel = label || title
  return (
    <div className={cn(statCardShellVariants({ variant, size }), className)}>
      <div className="flex flex-col">
        <span className={cn('mb-1 font-semibold uppercase tracking-wider', variant === 'legacy' ? 'text-lg text-gray-500' : 'text-xs text-slate-400')}>{displayLabel}</span>
        <span className={cn('font-bold', variant === 'legacy' ? 'text-xl text-gray-800' : 'text-2xl text-slate-900')}>{value}</span>
      </div>
      {icon && <div className={cn('flex shrink-0 items-center justify-center rounded-xl', variant === 'legacy' ? `p-2 bg-blue-100 ${themeIcon}` : `h-11 w-11 bg-primary/10 text-primary`)}>{icon}</div>}
    </div>
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-6', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('text-lg font-semibold tracking-tight text-foreground', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

export { Card }
