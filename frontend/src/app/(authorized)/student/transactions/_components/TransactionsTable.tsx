'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import { Pagination } from '@/components/ui/pagination'
import { PaymentStatus } from '@/lib/types'
import { getTransactionsSource } from '@/lib/data/transactions-source'
import { filterTransactions, formatDateTime, formatRupiah, paginateTransactions } from '@/lib/func'
import { SegmentedFilter } from '@/components/ui/SegmentedFilter'

type StatusFilter = 'ALL' | PaymentStatus

const ITEMS_PER_PAGE = 6

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
]

export default function TransactionsList() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Filter by search query
  const searchFiltered = useMemo(() => filterTransactions(getTransactionsSource(), searchQuery), [searchQuery])

  // Filter by status dropdown
  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return searchFiltered
    return searchFiltered.filter((item) => item.paymentStatus === statusFilter)
  }, [searchFiltered, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => paginateTransactions(filteredData, currentPage, ITEMS_PER_PAGE), [filteredData, currentPage])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchForm value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchQuery(searchInput)} placeholder="Cari ID transaksi atau nama kelas..." className="md:flex-1" />
      </div>
      <SegmentedFilter items={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} variant="scroll" />

      {/* Cards */}
      {paginatedData.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
          <p className="text-sm font-medium text-slate-400">Tidak ada transaksi yang ditemukan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {paginatedData.map((item) => (
            <Card
              key={item.uid}
              variant="transaction"
              image={item.courseImage}
              title={item.courseName}
              transactionId={item.transactionId}
              classType={item.classType}
              price={formatRupiah(item.price)}
              paymentStatus={item.paymentStatus}
              paymentMethod={item.paymentMethod}
              purchasedAt={formatDateTime(item.purchasedAt)}
              detailHref={`/student/transactions/${item.uid}`}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-slate-400">
        Menampilkan {paginatedData.length} dari {filteredData.length} transaksi
      </p>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}
