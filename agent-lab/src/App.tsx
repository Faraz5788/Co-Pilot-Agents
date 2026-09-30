import { Component, lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Home from '@/pages/Home'
import LearningPath from '@/pages/LearningPath'
import LevelPage from '@/pages/LevelPage'
import LessonPage from '@/pages/LessonPage'
import Missions from '@/pages/Missions'
import Achievements from '@/pages/Achievements'
import Resources from '@/pages/Resources'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import Family from '@/pages/Family'
import Chat from '@/pages/Chat'
import { AuthGate } from '@/components/cloud/AuthGate'
import { startCloudSync } from '@/cloud/sync'

startCloudSync()

const Playground = lazy(() => import('@/pages/Playground'))

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">An unexpected error stopped this screen from loading. Your progress is saved.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-3 text-left text-xs text-bad">{this.state.error.message}</pre>
        <button className="mt-6 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white" onClick={() => { this.setState({ error: null }); window.location.hash = '#/' }}>
          Back to home
        </button>
      </div>
    )
  }
}

const Loading = () => (
  <div className="flex h-[60vh] items-center justify-center text-sm text-muted">
    <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-accent" /> Loading canvas…
  </div>
)

export default function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<AuthGate><AppShell /></AuthGate>}>
            <Route index element={<Home />} />
            <Route path="path" element={<LearningPath />} />
            <Route path="level/:levelId" element={<LevelPage />} />
            <Route path="level/:levelId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="missions" element={<Missions />} />
            <Route path="playground" element={<Suspense fallback={<Loading />}><Playground /></Suspense>} />
            <Route path="family" element={<Family />} />
            <Route path="chat" element={<Chat />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="resources" element={<Resources />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  )
}
