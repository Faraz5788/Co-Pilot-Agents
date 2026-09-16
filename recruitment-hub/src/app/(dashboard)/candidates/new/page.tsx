import { createClient } from '@/lib/supabase/server'
import { getSources } from '@/lib/services/admin'
import { CandidateForm } from '@/components/candidates/candidate-form'

export default async function NewCandidatePage() {
  const supabase = await createClient()
  const sources = await getSources(supabase)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Candidate</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new candidate profile and optionally attach a CV.
        </p>
      </div>
      <CandidateForm sources={sources} />
    </div>
  )
}
