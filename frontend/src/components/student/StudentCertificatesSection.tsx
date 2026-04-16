'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Check, Download, Share2 } from 'lucide-react'
import { DataCertificates } from '@/lib/dummyData'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { FilterCheckboxPanel } from '@/components/ui/FilterCheckboxPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '../layout/PageHeader';

const DUMMY_CATEGORIES = ['Pengembangan Web', 'Desain UI/UX', 'Data Science & AI', 'Cybersecurity']
const ITEMS_PER_PAGE = 6

export default function StudentCertificatesSection() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedUid, setCopiedUid] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  const certificateRows = isMockDataEnabled() ? DataCertificates : []
  const filteredCertificates = certificateRows.filter((cert) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || cert.title.toLowerCase().includes(q) || cert.courseName.toLowerCase().includes(q)
    const categoryHit = selectedCategories.length === 0 || selectedCategories.includes(cert.category)
    return matchesSearch && categoryHit
  })

  const totalPages = Math.ceil(filteredCertificates.length / ITEMS_PER_PAGE)
  const paginatedCertificates = filteredCertificates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleShare = (uid: string) => {
    const shareUrl = `${window.location.origin}/certificate/${uid}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedUid(uid)
    setTimeout(() => setCopiedUid(null), 2000)
  }

  return (
    <section className="flex w-full flex-col gap-10 px-8 py-10">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6">
        <PageHeader
          title="Sertifikat Saya"
          subtitle="Lihat, unduh, dan bagikan bukti penyelesaian kursus Anda secara profesional."
        />

        <SearchForm value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchQuery(searchInput)} placeholder="Cari sertifikat atau nama kursus..." />
      </div>

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <FilterCheckboxPanel
          title="Kategori"
          options={DUMMY_CATEGORIES}
          selected={selectedCategories}
          onToggle={(cat) => setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))}
          innerClassName="border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] shadow-xs"
        />

        <div className="min-w-0 flex-1">
          {filteredCertificates.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedCertificates.map((cert) => (
                  <Card key={cert.uid} className="overflow-hidden hover:shadow-sm transition-all duration-300 shadow-xs">
                    <div className="relative flex aspect-4/3 w-full items-center justify-center border-b border-slate-100 bg-slate-50 p-6">
                      <Image src={cert.imageUrl || 'https://picsum.photos/seed/cert/800/600'} alt={cert.title} fill className="object-cover" />
                    </div>
                    <CardContent className="flex flex-1 flex-col p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">{cert.category}</p>
                      <h4 className="mb-1 line-clamp-1 font-bold leading-snug text-slate-900">{cert.title}</h4>
                      <p className="mb-4 line-clamp-1 text-sm text-slate-500">{cert.courseName}</p>
                      <div className="mb-6 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">ID Kredensial: {cert.credentialId}</span>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <Button type="button" variant="default" className="flex-1">
                          <Download data-icon="inline-start" />
                          Unduh
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => handleShare(cert.uid)} className="flex-1">
                          {copiedUid === cert.uid ? <Check data-icon="inline-start" /> : <Share2 data-icon="inline-start" />}
                          {copiedUid === cert.uid ? 'Disalin' : 'Bagikan'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                <EmptyCourseIcon className="mb-6 h-40 w-40" />
                <h3 className="mb-2 text-xl font-bold text-slate-900">Ups, sertifikat tidak ditemukan</h3>
                <p className="max-w-sm text-sm leading-relaxed text-slate-500">Kami tidak menemukan sertifikat yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
