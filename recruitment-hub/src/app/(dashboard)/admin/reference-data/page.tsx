import { createClient } from '@/lib/supabase/server'
import {
  getDepartments,
  getLocations,
  getCostCentres,
  getJobProfiles,
  getPositions,
  getGrades,
  getCompetencies,
} from '@/lib/services/admin'
import { ReferenceDataPage } from '@/components/admin/reference-data-page'
import type {
  CompetencyRow,
  CostCentreRow,
  DepartmentRow,
  GradeRow,
  JobProfileRow,
  LocationRow,
  PositionRow,
} from '@/types/admin'

export const metadata = {
  title: 'Reference Data',
}

export default async function AdminReferenceDataPage() {
  const supabase = await createClient()

  const [departments, locations, costCentres, jobProfiles, positions, grades, competencies] =
    await Promise.all([
      getDepartments(supabase),
      getLocations(supabase),
      getCostCentres(supabase),
      getJobProfiles(supabase),
      getPositions(supabase),
      getGrades(supabase),
      getCompetencies(supabase),
    ])

  return (
    <ReferenceDataPage
      departments={departments as unknown as DepartmentRow[]}
      locations={locations as unknown as LocationRow[]}
      costCentres={costCentres as unknown as CostCentreRow[]}
      jobProfiles={jobProfiles as unknown as JobProfileRow[]}
      positions={positions as unknown as PositionRow[]}
      grades={grades as unknown as GradeRow[]}
      competencies={competencies as unknown as CompetencyRow[]}
    />
  )
}
