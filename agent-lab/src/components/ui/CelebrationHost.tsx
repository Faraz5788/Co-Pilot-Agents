import { useNavigate } from 'react-router-dom'
import { LEVELS } from '@/content/course'
import { getAchievement } from '@/content/achievements'
import { useUi } from '@/state/ui'
import { Button } from './primitives'
import { Confetti } from './Confetti'
import { Icon } from './Icon'
import { Modal } from './Modal'

export function CelebrationHost() {
  const c = useUi((s) => s.celebrations[0])
  const shift = useUi((s) => s.shiftCelebration)
  const navigate = useNavigate()
  if (!c) return null

  if (c.type === 'level') {
    const level = LEVELS.find((l) => l.number === c.levelNumber)
    const next = LEVELS.find((l) => l.number === c.levelNumber + 1)
    const badge = level && getAchievement(level.badgeId)
    return (
      <>
        <Confetti />
        <Modal open onClose={shift} className="max-w-md text-center" title={undefined}>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand text-white shadow-[0_10px_40px_-10px_var(--accent)] animate-pop">
            <Icon name="trophy" size={38} />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Level {c.levelNumber} complete</div>
          <h2 className="mt-1 font-display text-2xl font-bold">{c.title}</h2>
          <p className="mt-2 text-sm text-muted">
            You unlocked <span className="font-semibold text-fg">{c.unlocks}</span> and earned <span className="font-semibold text-fg">+{c.xp} XP</span>.
          </p>
          {badge && (
            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] px-3 py-1.5 text-sm font-semibold text-gold">
              <Icon name={badge.icon} size={16} /> Badge: {badge.name}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {next ? (
              <Button
                data-autofocus
                iconRight="arrow-right"
                onClick={() => {
                  shift()
                  navigate(`/level/${next.id}`)
                }}
              >
                Start Level {next.number}
              </Button>
            ) : (
              <Button data-autofocus onClick={() => { shift(); navigate('/achievements') }} icon="award">
                See achievements
              </Button>
            )}
            <Button variant="secondary" onClick={shift}>
              Keep reviewing
            </Button>
          </div>
        </Modal>
      </>
    )
  }
  return null
}
