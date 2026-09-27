import { Navigate, useParams } from 'react-router-dom'
import { findLesson } from '@/content/course'
import { isLessonUnlocked, useProgress } from '@/state/progress'
import { LessonPlayer } from '@/components/learning/LessonPlayer'

export default function LessonPage() {
  const { levelId = '', lessonId = '' } = useParams()
  const found = findLesson(lessonId)
  const unlocked = useProgress((s) => (found ? isLessonUnlocked(s, found.level.id, lessonId) : false))
  if (!found || found.level.id !== levelId) return <Navigate to="/path" replace />
  if (!unlocked) return <Navigate to={`/level/${levelId}`} replace />
  return <LessonPlayer key={lessonId} level={found.level} lesson={found.lesson} />
}
