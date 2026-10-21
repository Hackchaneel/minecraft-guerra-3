import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
}) : null

export const ADMIN_KEY_STORAGE = 'mg3:roulette-admin-key'

export async function callRouletteAdmin(key, action, payload = {}) {
  if (!supabase) throw new Error('Supabase não está configurado neste site.')
  const { data, error } = await supabase.functions.invoke('roulette-admin', {
    body: { action, payload },
    headers: { 'x-mg3-admin-key': key },
  })
  if (error) {
    let message = error.message
    try {
      const details = await error.context?.json()
      if (details?.error) message = details.error
    } catch { /* Keep the SDK error when no JSON body is available. */ }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}
