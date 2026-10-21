import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mg3-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

async function sameSecret(candidate: string, expected: string) {
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(candidate)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ])
  const left = new Uint8Array(a)
  const right = new Uint8Array(b)
  let mismatch = 0
  for (let i = 0; i < left.length; i++) mismatch |= left[i] ^ right[i]
  return mismatch === 0
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  const expected = Deno.env.get('MG3_ADMIN_KEY')
  if (!expected) return json({ error: 'A chave do administrador ainda não foi configurada no Supabase.' }, 503)
  const supplied = request.headers.get('x-mg3-admin-key') ?? ''
  if (!supplied || !(await sameSecret(supplied, expected))) return json({ error: 'Chave de administrador inválida.' }, 401)

  let body: { action?: string; payload?: Record<string, unknown> }
  try { body = await request.json() } catch { return json({ error: 'Requisição inválida.' }, 400) }
  if (body.action === 'verify') return json({ ok: true })
  if (!['add_players', 'remove_player', 'spin', 'reset'].includes(body.action ?? '')) return json({ error: 'Ação inválida.' }, 400)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.rpc('mg3_roulette_admin_action', {
    p_action: body.action,
    p_payload: body.payload ?? {},
  })
  if (error) return json({ error: error.message }, 400)
  return json({ state: data })
})
