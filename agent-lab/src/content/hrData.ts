/**
 * Fictional sample workforce data for "Halcyon Group".
 * Every organisation, team and number here is invented for teaching purposes.
 * Period: 12 months to 31 Aug 2026. Hierarchy: Division → Department → Team → Location.
 */
export const ORG_NAME = 'Halcyon Group'
export const PERIOD_LABEL = '12 months to 31 Aug 2026'
export const AS_OF = '31 Aug 2026'

export interface WorkforceRow {
  division: string
  department: string
  team: string
  location: string
  headcountEnd: number
  joiners: number
  voluntaryLeavers: number
  involuntaryLeavers: number
  /** Voluntary attrition % in the prior 12 months (for trend questions). */
  priorVoluntaryRate: number
}

export const WORKFORCE: WorkforceRow[] = [
  { division: 'Operations', department: 'Customer Service', team: 'Contact Centre', location: 'Manchester', headcountEnd: 2100, joiners: 470, voluntaryLeavers: 378, involuntaryLeavers: 64, priorVoluntaryRate: 12.4 },
  { division: 'Operations', department: 'Customer Service', team: 'Contact Centre', location: 'Glasgow', headcountEnd: 1250, joiners: 260, voluntaryLeavers: 205, involuntaryLeavers: 38, priorVoluntaryRate: 15.1 },
  { division: 'Operations', department: 'Fulfilment', team: 'Warehouse', location: 'Leeds', headcountEnd: 1600, joiners: 300, voluntaryLeavers: 240, involuntaryLeavers: 70, priorVoluntaryRate: 13.9 },
  { division: 'Operations', department: 'Fulfilment', team: 'Returns', location: 'Bristol', headcountEnd: 1040, joiners: 190, voluntaryLeavers: 150, involuntaryLeavers: 35, priorVoluntaryRate: 12.8 },
  { division: 'Technology', department: 'Engineering', team: 'Platform', location: 'Manchester', headcountEnd: 820, joiners: 110, voluntaryLeavers: 74, involuntaryLeavers: 12, priorVoluntaryRate: 8.1 },
  { division: 'Technology', department: 'Engineering', team: 'Product Engineering', location: 'London', headcountEnd: 760, joiners: 120, voluntaryLeavers: 88, involuntaryLeavers: 10, priorVoluntaryRate: 10.9 },
  { division: 'Technology', department: 'Data & Analytics', team: 'Insights', location: 'London', headcountEnd: 310, joiners: 45, voluntaryLeavers: 31, involuntaryLeavers: 4, priorVoluntaryRate: 9.6 },
  { division: 'Commercial', department: 'Sales', team: 'Field Sales', location: 'London', headcountEnd: 900, joiners: 150, voluntaryLeavers: 117, involuntaryLeavers: 27, priorVoluntaryRate: 12.2 },
  { division: 'Commercial', department: 'Sales', team: 'Inside Sales', location: 'Bristol', headcountEnd: 640, joiners: 120, voluntaryLeavers: 102, involuntaryLeavers: 22, priorVoluntaryRate: 14.6 },
  { division: 'Commercial', department: 'Marketing', team: 'Brand', location: 'London', headcountEnd: 280, joiners: 30, voluntaryLeavers: 25, involuntaryLeavers: 6, priorVoluntaryRate: 8.4 },
  { division: 'Corporate Services', department: 'People', team: 'HR Operations', location: 'Manchester', headcountEnd: 330, joiners: 36, voluntaryLeavers: 30, involuntaryLeavers: 5, priorVoluntaryRate: 8.8 },
  { division: 'Corporate Services', department: 'Finance', team: 'FP&A', location: 'Leeds', headcountEnd: 420, joiners: 40, voluntaryLeavers: 34, involuntaryLeavers: 6, priorVoluntaryRate: 7.9 },
]

export type Filter = Partial<Pick<WorkforceRow, 'division' | 'department' | 'team' | 'location'>>

export interface Metrics {
  headcountStart: number
  headcountEnd: number
  averageHeadcount: number
  joiners: number
  leavers: number
  voluntaryLeavers: number
  involuntaryLeavers: number
  voluntaryAttrition: number
  totalAttrition: number
  priorVoluntaryAttrition: number
}

export function rowsFor(filter: Filter = {}) {
  return WORKFORCE.filter((r) =>
    (Object.keys(filter) as (keyof Filter)[]).every((k) => !filter[k] || r[k] === filter[k]),
  )
}

export function metrics(filter: Filter = {}): Metrics {
  const rows = rowsFor(filter)
  const sum = (f: (r: WorkforceRow) => number) => rows.reduce((a, r) => a + f(r), 0)
  const headcountEnd = sum((r) => r.headcountEnd)
  const joiners = sum((r) => r.joiners)
  const voluntaryLeavers = sum((r) => r.voluntaryLeavers)
  const involuntaryLeavers = sum((r) => r.involuntaryLeavers)
  const leavers = voluntaryLeavers + involuntaryLeavers
  const headcountStart = headcountEnd - joiners + leavers
  const averageHeadcount = (headcountStart + headcountEnd) / 2
  const priorVolLeavers = sum((r) => (r.priorVoluntaryRate / 100) * (r.headcountEnd - r.joiners + r.voluntaryLeavers + r.involuntaryLeavers))
  return {
    headcountStart,
    headcountEnd,
    averageHeadcount,
    joiners,
    leavers,
    voluntaryLeavers,
    involuntaryLeavers,
    voluntaryAttrition: averageHeadcount ? (voluntaryLeavers / averageHeadcount) * 100 : 0,
    totalAttrition: averageHeadcount ? (leavers / averageHeadcount) * 100 : 0,
    priorVoluntaryAttrition: headcountStart ? (priorVolLeavers / headcountStart) * 100 : 0,
  }
}

export function groupBy(dim: keyof Filter, filter: Filter = {}) {
  const keys = Array.from(new Set(rowsFor(filter).map((r) => r[dim])))
  return keys
    .map((k) => ({ key: k, ...metrics({ ...filter, [dim]: k }) }))
    .sort((a, b) => b.headcountEnd - a.headcountEnd)
}

/** Teams whose voluntary attrition rose the most versus the prior year. */
export function attritionDrivers(limit = 3) {
  return WORKFORCE.map((r) => {
    const m = metrics({ team: r.team, location: r.location })
    return { label: `${r.team} · ${r.location}`, rate: m.voluntaryAttrition, prior: r.priorVoluntaryRate, delta: m.voluntaryAttrition - r.priorVoluntaryRate }
  })
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit)
}
