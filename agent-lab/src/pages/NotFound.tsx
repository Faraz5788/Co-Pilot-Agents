import { ButtonLink } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { Page } from '@/components/layout/Page'

export default function NotFound() {
  return (
    <Page className="py-24 text-center">
      <Icon name="radar" size={40} className="mx-auto mb-4 text-accent" />
      <h1 className="font-display text-3xl font-bold">This route has no agent assigned</h1>
      <p className="mt-2 text-muted">The page you’re looking for doesn’t exist.</p>
      <ButtonLink to="/" className="mt-6" icon="home">Back home</ButtonLink>
    </Page>
  )
}
