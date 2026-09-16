'use client'

/**
 * Toast notification hook, modeled on the shadcn/ui `use-toast` pattern
 * (a module-level reducer store shared across every `useToast()` consumer,
 * so a toast fired from anywhere in the tree renders wherever the toaster
 * component is mounted).
 *
 * Pair this with a `<Toaster />` component built on
 * `@radix-ui/react-toast` that reads `useToast().toasts` and renders one
 * `Toast` per entry, forwarding `onOpenChange` to `dismiss`.
 */

import * as React from 'react'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface ToastActionElement {
  altText: string
  label: React.ReactNode
  onClick: () => void
}

export interface ToasterToast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: ToastVariant
  open: boolean
  duration?: number
}

type ToastInput = Omit<ToasterToast, 'id' | 'open'>

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

let toastCounter = 0
function generateId(): string {
  toastCounter = (toastCounter + 1) % Number.MAX_SAFE_INTEGER
  return toastCounter.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function queueRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: 'REMOVE_TOAST', toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      if (toastId) {
        queueRemoval(toastId)
      } else {
        state.toasts.forEach((t) => queueRemoval(t.id))
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      }
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }

    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function toast(input: ToastInput) {
  const id = generateId()

  const update = (toastUpdate: Partial<ToasterToast>) =>
    dispatch({ type: 'UPDATE_TOAST', toast: { ...toastUpdate, id } })

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: { ...input, id, open: true },
  })

  return { id, update, dismiss }
}

/**
 * Returns the current toast list plus `toast()`/`dismiss()` helpers.
 * Mount a single `<Toaster />` (typically in the root layout) that consumes
 * `toasts` from this hook to render them; call `toast({ title, description })`
 * from anywhere to enqueue a new one.
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { toast }
