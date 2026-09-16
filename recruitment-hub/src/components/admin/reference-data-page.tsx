'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building,
  LayoutGrid,
  Loader2,
  MapPin,
  Plus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSyncedState } from '@/lib/hooks/use-synced-state'
import type {
  CompetencyRow,
  CostCentreRow,
  DepartmentRow,
  GradeRow,
  JobProfileRow,
  LocationRow,
  PositionRow,
} from '@/types/admin'

type EntityKey =
  | 'departments'
  | 'locations'
  | 'cost_centres'
  | 'job_profiles'
  | 'positions'
  | 'grades'
  | 'competencies'

interface GenericRow {
  id: string
  active?: boolean
  workday_id?: string | null
  [key: string]: unknown
}

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'number' | 'select'
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

interface ColumnDef {
  key: string
  label: string
  render?: (row: GenericRow) => ReactNode
}

interface TabConfig {
  key: EntityKey
  label: string
  icon: LucideIcon
  supportsWorkday: boolean
  columns: ColumnDef[]
  fields: FieldDef[]
}

interface ReferenceDataPageProps {
  departments: DepartmentRow[]
  locations: LocationRow[]
  costCentres: CostCentreRow[]
  jobProfiles: JobProfileRow[]
  positions: PositionRow[]
  grades: GradeRow[]
  competencies: CompetencyRow[]
}

function textColumn(key: string, label: string): ColumnDef {
  return { key, label, render: (row) => (row[key] as string | null) || '—' }
}

export function ReferenceDataPage({
  departments: initialDepartments,
  locations: initialLocations,
  costCentres: initialCostCentres,
  jobProfiles: initialJobProfiles,
  positions: initialPositions,
  grades: initialGrades,
  competencies: initialCompetencies,
}: ReferenceDataPageProps) {
  const router = useRouter()

  const [departments, setDepartments] = useSyncedState<GenericRow[]>(initialDepartments as unknown as GenericRow[])
  const [locations, setLocations] = useSyncedState<GenericRow[]>(initialLocations as unknown as GenericRow[])
  const [costCentres, setCostCentres] = useSyncedState<GenericRow[]>(initialCostCentres as unknown as GenericRow[])
  const [jobProfiles, setJobProfiles] = useSyncedState<GenericRow[]>(initialJobProfiles as unknown as GenericRow[])
  const [positions, setPositions] = useSyncedState<GenericRow[]>(initialPositions as unknown as GenericRow[])
  const [grades, setGrades] = useSyncedState<GenericRow[]>(initialGrades as unknown as GenericRow[])
  const [competencies, setCompetencies] = useSyncedState<GenericRow[]>(initialCompetencies as unknown as GenericRow[])

  const dataByEntity: Record<EntityKey, GenericRow[]> = {
    departments,
    locations,
    cost_centres: costCentres,
    job_profiles: jobProfiles,
    positions,
    grades,
    competencies,
  }

  const setterByEntity: Record<EntityKey, (rows: GenericRow[]) => void> = {
    departments: setDepartments,
    locations: setLocations,
    cost_centres: setCostCentres,
    job_profiles: setJobProfiles,
    positions: setPositions,
    grades: setGrades,
    competencies: setCompetencies,
  }

  const tabs: TabConfig[] = useMemo(
    () => [
      {
        key: 'departments',
        label: 'Departments',
        icon: Building,
        supportsWorkday: true,
        columns: [textColumn('name', 'Name'), textColumn('code', 'Code')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text' },
        ],
      },
      {
        key: 'locations',
        label: 'Locations',
        icon: MapPin,
        supportsWorkday: true,
        columns: [textColumn('name', 'Name'), textColumn('city', 'City'), textColumn('country', 'Country')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'city', label: 'City', type: 'text' },
          { key: 'country', label: 'Country', type: 'text' },
        ],
      },
      {
        key: 'cost_centres',
        label: 'Cost Centres',
        icon: Wallet,
        supportsWorkday: true,
        columns: [textColumn('name', 'Name'), textColumn('code', 'Code')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text' },
        ],
      },
      {
        key: 'job_profiles',
        label: 'Job Profiles',
        icon: Briefcase,
        supportsWorkday: true,
        columns: [textColumn('name', 'Name'), textColumn('code', 'Code'), textColumn('level', 'Level')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text' },
          { key: 'level', label: 'Level', type: 'text' },
        ],
      },
      {
        key: 'positions',
        label: 'Positions',
        icon: LayoutGrid,
        supportsWorkday: true,
        columns: [
          textColumn('title', 'Title'),
          textColumn('position_number', 'Position #'),
          {
            key: 'job_profile',
            label: 'Job Profile',
            render: (row) => (row.job_profile as { name: string } | null)?.name ?? '—',
          },
          {
            key: 'department',
            label: 'Department',
            render: (row) => (row.department as { name: string } | null)?.name ?? '—',
          },
        ],
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'position_number', label: 'Position Number', type: 'text' },
          {
            key: 'job_profile_id',
            label: 'Job Profile',
            type: 'select',
            options: initialJobProfiles.map((jp) => ({ value: jp.id, label: jp.name })),
          },
          {
            key: 'department_id',
            label: 'Department',
            type: 'select',
            options: initialDepartments.map((d) => ({ value: d.id, label: d.name })),
          },
        ],
      },
      {
        key: 'grades',
        label: 'Grades',
        icon: Award,
        supportsWorkday: true,
        columns: [textColumn('name', 'Name'), textColumn('level', 'Level')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'level', label: 'Level', type: 'number' },
        ],
      },
      {
        key: 'competencies',
        label: 'Competencies',
        icon: BadgeCheck,
        supportsWorkday: false,
        columns: [textColumn('name', 'Name'), textColumn('category', 'Category'), textColumn('description', 'Description')],
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
        ],
      },
    ],
    [initialDepartments, initialJobProfiles]
  )

  const [activeTabKey, setActiveTabKey] = useState<EntityKey>('departments')
  const activeTab = tabs.find((t) => t.key === activeTabKey) ?? tabs[0]

  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function switchTab(key: EntityKey) {
    setActiveTabKey(key)
    setShowForm(false)
    setFormValues({})
    setError(null)
  }

  async function createRow() {
    const missingRequired = activeTab.fields.find((f) => f.required && !formValues[f.key]?.trim())
    if (missingRequired) {
      setError(`${missingRequired.label} is required`)
      return
    }

    setCreating(true)
    setError(null)
    try {
      const values: Record<string, unknown> = {}
      for (const field of activeTab.fields) {
        const raw = formValues[field.key]
        if (raw === undefined || raw === '') continue
        values[field.key] = field.type === 'number' ? Number(raw) : raw
      }

      const res = await fetch('/api/admin/reference-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: activeTab.key, values }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to create record')
      }

      setFormValues({})
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(row: GenericRow) {
    setBusyId(row.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/reference-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: activeTab.key, id: row.id, values: { active: !row.active } }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to update record')
      }
      const rows = dataByEntity[activeTab.key]
      setterByEntity[activeTab.key](
        rows.map((r) => (r.id === row.id ? { ...r, active: !r.active } : r))
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record')
    } finally {
      setBusyId(null)
    }
  }

  const rows = dataByEntity[activeTab.key]

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Reference Data</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Organisational data used across requisitions, offers and reporting. Records synced from
          Workday are marked accordingly.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === activeTab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {dataByEntity[tab.key].length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v)
            setFormValues({})
            setError(null)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab.label.replace(/s$/, '')}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
            New {activeTab.label.replace(/s$/, '').toLowerCase()}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeTab.fields.map((field) => (
              <div key={field.key}>
                {field.type === 'select' ? (
                  <select
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">{field.label}...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={`${field.label}${field.required ? ' *' : ''}`}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={createRow}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {activeTab.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Active</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row.id} className={cn(row.active === false && 'opacity-60')}>
                {activeTab.columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className={colIdx === 0 ? 'font-medium text-gray-900 dark:text-gray-50' : ''}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </span>
                    {colIdx === 0 && activeTab.supportsWorkday && row.workday_id ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700">
                        Workday
                      </span>
                    ) : null}
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                  {row.active === false ? 'Inactive' : 'Active'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => toggleActive(row)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {busyId === row.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {row.active === false ? 'Activate' : 'Deactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            No {activeTab.label.toLowerCase()} configured yet.
          </div>
        )}
      </div>
    </div>
  )
}
