import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!url || !anonKey) return null

  if (!cached) {
    cached = createClient(url, anonKey)
  }

  return cached
}

export function getTeashopId(): string {
  const id = import.meta.env.VITE_TEASHOP_ID as string | undefined
  return id && id.trim().length > 0 ? id.trim() : 'default'
}

const CLIENT_ID_KEY = 'teashop_client_id_v1'

export function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY)
    if (existing) return existing

    const next = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, next)
    return next
  } catch {
    return 'unknown'
  }
}
