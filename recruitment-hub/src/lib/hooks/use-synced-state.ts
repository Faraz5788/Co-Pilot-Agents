import { useState, type Dispatch, type SetStateAction } from 'react'

/**
 * Local, mutable copy of a value that comes from props (typically server
 * component data passed into a 'use client' child), kept in sync whenever
 * that value changes — e.g. after `router.refresh()` re-runs the parent
 * server component and hands down fresh data.
 *
 * This intentionally resets state during render (the pattern React's own
 * docs recommend for "adjusting state when a prop changes") rather than in
 * a `useEffect`, so consumers can still make optimistic local edits between
 * refreshes without an effect re-render round-trip.
 * See: https://react.dev/learn/you-might-not-need-an-effect
 */
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
  const [prevValue, setPrevValue] = useState(value)
  const [state, setState] = useState(value)

  if (prevValue !== value) {
    setPrevValue(value)
    setState(value)
  }

  return [state, setState]
}
