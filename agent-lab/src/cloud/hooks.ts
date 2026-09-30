import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { uid as makeId } from '@/lib/cn'
import { useAuth } from './auth'
import { supabase, type ActivityRow, type MessageRow, type Profile, type ProgressRow } from './client'

export interface Member extends Profile {
  progress: ProgressRow | null
}

/** Family members with their progress summary, live. */
export function useFamilyMembers() {
  const familyId = useAuth((s) => s.profile?.family_id)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase || !familyId) {
      setMembers([])
      setLoading(false)
      return
    }
    const { data: profiles } = await supabase.from('profiles').select('*').eq('family_id', familyId)
    const ids = (profiles ?? []).map((p) => p.id)
    const { data: progress } = ids.length
      ? await supabase.from('progress').select('user_id,xp,current_level,levels_completed,lessons_completed,badges,streak,updated_at').in('user_id', ids)
      : { data: [] as ProgressRow[] }
    const byUser = new Map((progress ?? []).map((p) => [p.user_id, p as ProgressRow]))
    setMembers(((profiles ?? []) as Profile[]).map((p) => ({ ...p, progress: byUser.get(p.id) ?? null })).sort((a, b) => (b.progress?.xp ?? 0) - (a.progress?.xp ?? 0)))
    setLoading(false)
  }, [familyId])

  useEffect(() => {
    load()
    if (!supabase || !familyId) return
    const ch = supabase
      .channel(`members:${familyId}:${makeId('rt')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => {
      supabase?.removeChannel(ch)
    }
  }, [familyId, load])

  return { members, loading, reload: load }
}

/** Latest family milestones, live. */
export function useActivityFeed(limit = 30) {
  const familyId = useAuth((s) => s.profile?.family_id)
  const [items, setItems] = useState<ActivityRow[]>([])
  useEffect(() => {
    if (!supabase || !familyId) return
    supabase.from('activity').select('*').eq('family_id', familyId).order('created_at', { ascending: false }).limit(limit).then(({ data }) => setItems(data ?? []))
    const ch = supabase
      .channel(`activity:${familyId}:${makeId('rt')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity', filter: `family_id=eq.${familyId}` }, (p) =>
        setItems((x) => [p.new as ActivityRow, ...x].slice(0, limit)),
      )
      .subscribe()
    return () => {
      supabase?.removeChannel(ch)
    }
  }, [familyId, limit])
  return items
}

/** Messages in one channel ('family' or 'lesson:<id>'), live. */
export function useMessages(channel: string) {
  const familyId = useAuth((s) => s.profile?.family_id)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMessages([])
    if (!supabase || !familyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('messages')
      .select('*')
      .eq('family_id', familyId)
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setMessages((data ?? []).reverse())
        setLoading(false)
      })
    const ch = supabase
      .channel(`messages:${familyId}:${channel}:${makeId('rt')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `family_id=eq.${familyId}` }, (p) => {
        if (p.eventType === 'INSERT') {
          const m = p.new as MessageRow
          if (m.channel === channel) setMessages((x) => (x.some((y) => y.id === m.id) ? x : [...x, m]))
        } else if (p.eventType === 'UPDATE') {
          const m = p.new as MessageRow
          setMessages((x) => x.map((y) => (y.id === m.id ? m : y)))
        } else if (p.eventType === 'DELETE') {
          const id = (p.old as { id: number }).id
          setMessages((x) => x.filter((y) => y.id !== id))
        }
      })
      .subscribe()
    return () => {
      supabase?.removeChannel(ch)
    }
  }, [familyId, channel])

  const send = async (body: string, isQuestion: boolean) => {
    const uid = useAuth.getState().session?.user.id
    if (!supabase || !familyId || !uid) return
    const { data, error } = await supabase.from('messages').insert({ family_id: familyId, user_id: uid, channel, body, is_question: isQuestion }).select().single()
    if (error) throw error
    setMessages((x) => (x.some((y) => y.id === data.id) ? x : [...x, data as MessageRow]))
  }
  const setAnswered = async (id: number, answered: boolean) => {
    if (!supabase) return
    setMessages((x) => x.map((y) => (y.id === id ? { ...y, answered } : y)))
    await supabase.from('messages').update({ answered }).eq('id', id)
  }
  const remove = async (id: number) => {
    if (!supabase) return
    setMessages((x) => x.filter((y) => y.id !== id))
    await supabase.from('messages').delete().eq('id', id)
  }
  return { messages, loading, send, setAnswered, remove }
}

/*
 * Presence: one shared channel per family (every member must join the same
 * topic), reference-counted so several components can read it at once.
 */
let presenceChannel: RealtimeChannel | null = null
let presenceKey = ''
let presenceUsers = 0
let online = new Set<string>()
const presenceListeners = new Set<() => void>()
const emit = () => presenceListeners.forEach((l) => l())

function joinPresence(familyId: string, uid: string) {
  const key = `${familyId}:${uid}`
  presenceUsers++
  if (presenceChannel && presenceKey === key) return
  if (presenceChannel) supabase?.removeChannel(presenceChannel)
  presenceKey = key
  const ch = supabase!.channel(`presence:${familyId}`, { config: { presence: { key: uid } } })
  presenceChannel = ch
  ch.on('presence', { event: 'sync' }, () => {
    online = new Set(Object.keys(ch.presenceState()))
    emit()
  }).subscribe((status) => {
    if (status === 'SUBSCRIBED') ch.track({ at: Date.now() })
  })
}

function leavePresence() {
  presenceUsers = Math.max(0, presenceUsers - 1)
  if (presenceUsers === 0 && presenceChannel) {
    supabase?.removeChannel(presenceChannel)
    presenceChannel = null
    presenceKey = ''
    online = new Set()
    emit()
  }
}

/** Who in the family has the app open right now. */
export function usePresence() {
  const familyId = useAuth((s) => s.profile?.family_id)
  const uid = useAuth((s) => s.session?.user.id)
  useEffect(() => {
    if (!supabase || !familyId || !uid) return
    joinPresence(familyId, uid)
    return leavePresence
  }, [familyId, uid])
  return useSyncExternalStore(
    (l) => {
      presenceListeners.add(l)
      return () => presenceListeners.delete(l)
    },
    () => online,
  )
}
