import { createClient } from '@/lib/supabase/server'
import {
  getDepartments,
  getLocations,
  getCostCentres,
  getJobProfiles,
  getPositions,
  getGrades,
  getUsers,
} from '@/lib/services/admin'
import { RequisitionForm } from '@/components/requisitions/requisition-form'
import type { RequisitionReferenceData } from '@/components/requisitions/types'

export default async function NewRequisitionPage() {
  const supabase = await createClient()

  const [departments, locations, costCentres, jobProfiles, positions, grades, users] = await Promise.all([
    getDepartments(supabase),
    getLocations(supabase),
    getCostCentres(supabase),
    getJobProfiles(supabase),
    getPositions(supabase),
    getGrades(supabase),
    getUsers(supabase),
  ])

  const referenceData: RequisitionReferenceData = {
    departments,
    locations,
    costCentres,
    jobProfiles,
    positions,
    grades,
    users: users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      status: u.status,
    })),
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Requisition</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to raise a new requisition.
        </p>
      </div>

      <RequisitionForm mode="create" referenceData={referenceData} />
    </div>
  )
}
