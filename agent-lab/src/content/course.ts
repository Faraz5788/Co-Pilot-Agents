import type { Lesson, Level, Step } from './types'
import { level1 } from './lessons/level1'
import { level2 } from './lessons/level2'
import { level3 } from './lessons/level3'
import { level4 } from './lessons/level4'
import { level5 } from './lessons/level5'
import { level6 } from './lessons/level6'
import { level7 } from './lessons/level7'
import { level8 } from './lessons/level8'

export const LEVELS: Level[] = [level1, level2, level3, level4, level5, level6, level7, level8]

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id)

export function findLesson(lessonId: string): { level: Level; lesson: Lesson; index: number } | undefined {
  for (const level of LEVELS) {
    const index = level.lessons.findIndex((l) => l.id === lessonId)
    if (index >= 0) return { level, lesson: level.lessons[index], index }
  }
}

export const stepKey = (lessonId: string, stepId: string) => `${lessonId}/${stepId}`

export function allSteps(): { level: Level; lesson: Lesson; step: Step }[] {
  return LEVELS.flatMap((level) => level.lessons.flatMap((lesson) => lesson.steps.map((step) => ({ level, lesson, step }))))
}

export const TOTAL_LESSONS = LEVELS.reduce((a, l) => a + l.lessons.length, 0)
