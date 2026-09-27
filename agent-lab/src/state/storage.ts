/**
 * Persistence boundary. V1 stores progress in localStorage; swap in a
 * `ProgressRepository` backed by an API to sync across devices later.
 */
import type { StateStorage } from 'zustand/middleware'

export interface ProgressRepository {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

const memory = new Map<string, string>()

/** localStorage with an in-memory fallback (private mode, blocked storage). */
export const localRepository: ProgressRepository = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memory.get(key) ?? null
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      memory.set(key, value)
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      memory.delete(key)
    }
  },
}

/** Example of how a remote backend would plug in. Not used in V1. */
export function createHttpRepository(baseUrl: string, token?: string): ProgressRepository {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  return {
    async getItem(key) {
      const r = await fetch(`${baseUrl}/progress/${encodeURIComponent(key)}`, { headers })
      return r.ok ? r.text() : null
    },
    async setItem(key, value) {
      await fetch(`${baseUrl}/progress/${encodeURIComponent(key)}`, { method: 'PUT', headers, body: value })
    },
    async removeItem(key) {
      await fetch(`${baseUrl}/progress/${encodeURIComponent(key)}`, { method: 'DELETE', headers })
    },
  }
}

export const toStateStorage = (repo: ProgressRepository): StateStorage => repo

export const STORAGE_KEY = 'agent-lab:progress'
