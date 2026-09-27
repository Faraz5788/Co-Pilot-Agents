import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LabGraph } from '@/engine/graph'
import { planSimulation, type SimOptions, type SimPlan } from '@/engine/simulation'
import { useProgress } from '@/state/progress'
import type { Highlight } from './FlowCanvas'
import type { SimStatus } from './LabNodeView'

export type PlayerStatus = 'idle' | 'running' | 'awaiting' | 'done' | 'rejected' | 'invalid'

export function useSimPlayer(graph: LabGraph, onFinish?: (plan: SimPlan, status: PlayerStatus) => void) {
  const [plan, setPlan] = useState<SimPlan | null>(null)
  const [index, setIndex] = useState(-1)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const reduced = useProgress((s) => s.settings.reducedMotion)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish
  const speed = reduced ? 350 : 1150

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
  }

  const run = useCallback(
    (opts: SimOptions) => {
      clear()
      const p = planSimulation(graph, opts)
      setPlan(p)
      if (!p.steps.length) {
        setStatus('invalid')
        setIndex(-1)
        return
      }
      setIndex(0)
      setStatus('running')
    },
    [graph],
  )

  useEffect(() => {
    if (status !== 'running' || !plan) return
    const step = plan.steps[index]
    if (step?.awaitApproval) {
      setStatus('awaiting')
      return
    }
    timer.current = setTimeout(() => {
      if (index + 1 >= plan.steps.length) {
        setStatus('done')
        finishRef.current?.(plan, 'done')
      } else setIndex(index + 1)
    }, speed)
    return clear
  }, [status, index, plan, speed])

  const approve = () => {
    if (!plan) return
    if (index + 1 >= plan.steps.length) {
      setStatus('done')
      finishRef.current?.(plan, 'done')
    } else {
      setIndex(index + 1)
      setStatus('running')
    }
  }
  const reject = () => {
    setStatus('rejected')
    if (plan) finishRef.current?.(plan, 'rejected')
  }
  const reset = () => {
    clear()
    setPlan(null)
    setIndex(-1)
    setStatus('idle')
  }

  // Graph edits invalidate a finished run.
  const graphRef = useRef(graph)
  useEffect(() => {
    if (graphRef.current !== graph && (status === 'done' || status === 'rejected' || status === 'invalid')) reset()
    graphRef.current = graph
  }, [graph, status])

  const highlight: Highlight | undefined = useMemo(() => {
    if (!plan || index < 0) return undefined
    const nodes: Record<string, SimStatus> = {}
    const activeEdges = new Set<string>()
    const doneEdges = new Set<string>()
    const rank: Record<SimStatus, number> = { done: 0, warn: 1, fail: 2, active: 3, waiting: 3 }
    const settled: Record<string, SimStatus> = {}
    plan.steps.slice(0, index + 1).forEach((s, i) => {
      const current = i === index && (status === 'running' || status === 'awaiting')
      s.nodeIds.forEach((id) => {
        const t = s.nodeTones?.[id]
        const st: SimStatus = t === 'bad' ? 'fail' : t === 'warn' ? 'warn' : 'done'
        if (!settled[id] || rank[st] > rank[settled[id]]) settled[id] = st
        nodes[id] = current ? (status === 'awaiting' && s.awaitApproval?.nodeId === id ? 'waiting' : 'active') : settled[id]
      })
      s.edgeIds.forEach((e) => (current ? activeEdges.add(e) : doneEdges.add(e)))
    })
    if (status === 'rejected') {
      const last = plan.steps[index]
      last?.nodeIds.forEach((id) => (nodes[id] = 'fail'))
    }
    return { nodes, activeEdges, doneEdges }
  }, [plan, index, status])

  return { plan, index, status, run, approve, reject, reset, highlight }
}
