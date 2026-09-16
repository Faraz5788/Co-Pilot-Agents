'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Eye, Inbox, Plus, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OFFER_STATUS_COLORS, OFFER_STATUS_LABELS } from '@/lib/constants'
import type { OfferStatus } from '@/types/database'
import { OfferForm, type ApplicationOption, type GradeOption, type LocationOption } from './offer-form'
import { OfferDetail, type OfferApprover, type OfferRecord } from './offer-detail'

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface OfferListPageProps {
  offers: OfferRecord[]
  pagination: Pagination
  applications: ApplicationOption[]
  grades: GradeOption[]
  locations: LocationOption[]
  approvers: OfferApprover[]
  currentUserId: string | null
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
      amount
    )
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function OfferListPage({
  offers,
  pagination,
  applications,
  grades,
  locations,
  approvers,
  currentUserId,
}: OfferListPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [formOpen, setFormOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null)
  const [viewingOffer, setViewingOffer] = useState<OfferRecord | null>(null)

  const statusFilter = searchParams.get('status') ?? ''

  function updateStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  function openCreate() {
    setEditingOffer(null)
    setFormOpen(true)
  }

  function openEdit(offer: OfferRecord) {
    setViewingOffer(null)
    setEditingOffer(offer)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Offers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, approve and track offers through to acceptance.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Offer
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          Filters
        </div>
        <select
          value={statusFilter}
          onChange={(e) => updateStatus(e.target.value)}
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {Object.entries(OFFER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-gray-400">
          <Inbox className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm font-medium">No offers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Requisition</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Job Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Salary</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {offer.application?.candidate
                      ? `${offer.application.candidate.first_name} ${offer.application.candidate.last_name}`
                      : 'Unknown candidate'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {offer.application?.requisition?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{offer.job_title}</td>
                  <td className="px-4 py-3 text-gray-600">{formatMoney(offer.salary, offer.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        OFFER_STATUS_COLORS[offer.status as OfferStatus]
                      )}
                    >
                      {OFFER_STATUS_LABELS[offer.status as OfferStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(offer.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingOffer(offer)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                  className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                  className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {formOpen ? (
        <OfferForm
          applications={applications}
          grades={grades}
          locations={locations}
          approvers={approvers}
          offer={editingOffer}
          onSaved={() => router.refresh()}
          onClose={() => setFormOpen(false)}
        />
      ) : null}

      {viewingOffer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingOffer(null)}
              className="absolute right-3 top-3 z-10 hidden"
            >
              <X className="h-5 w-5" />
            </button>
            <OfferDetail
              offer={viewingOffer}
              currentUserId={currentUserId}
              approvers={approvers}
              onEdit={() => openEdit(viewingOffer)}
              onChanged={() => {
                router.refresh()
                setViewingOffer(null)
              }}
              onClose={() => setViewingOffer(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
