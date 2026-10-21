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
  if (!['add_players', 'remove_player', 'spin', 'reset', 'secrets_save'].includes(body.action ?? '')) return json({ error: 'Ação inválida.' }, 400)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (body.action === 'secrets_save') {
    const requestedItems = body.payload?.items
    if (!Array.isArray(requestedItems) || requestedItems.length < 1 || requestedItems.length > 20) {
      return json({ error: 'O carrossel precisa ter entre 1 e 20 cartões.' }, 400)
    }
    const { data: previous, error: readError } = await supabase.from('mg3_secrets_state').select('items').eq('id', true).maybeSingle()
    if (readError) return json({ error: readError.message }, 400)
    const previousItems = Array.isArray(previous?.items) ? previous.items as Record<string, unknown>[] : []
    const uploadedPaths: string[] = []
    const nextItems: Record<string, unknown>[] = []
    const bucket = 'mg3-secret-images'

    for (const entry of requestedItems) {
      if (!entry || typeof entry !== 'object') return json({ error: 'Um dos cartões está inválido.' }, 400)
      const raw = entry as Record<string, unknown>
      const id = typeof raw.id === 'string' ? raw.id.slice(0, 80) : crypto.randomUUID()
      const title = typeof raw.title === 'string' ? raw.title.trim() : ''
      const text = typeof raw.text === 'string' ? raw.text.trim() : ''
      if (!id || !title || title.length > 80 || text.length > 2000) return json({ error: 'Confira os títulos e textos (máximo: 80 e 2.000 caracteres).' }, 400)
      const old = previousItems.find((item) => item.id === id)
      let image = typeof old?.image === 'string' ? old.image : null
      let imagePath = typeof old?.imagePath === 'string' ? old.imagePath : null
      if (typeof raw.imageData === 'string') {
        if (raw.imageData.length > 4_200_000) return json({ error: 'A imagem otimizada ultrapassou 3 MB.' }, 413)
        let bytes: Uint8Array
        try { bytes = Uint8Array.from(atob(raw.imageData), (character) => character.charCodeAt(0)) }
        catch { return json({ error: 'Os dados da imagem são inválidos.' }, 400) }
        const webpSignature = bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
        if (!webpSignature || bytes.length > 3 * 1024 * 1024) return json({ error: 'Envie uma imagem válida de até 3 MB.' }, 400)
        imagePath = `secrets/${crypto.randomUUID()}.webp`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(imagePath, bytes, {
          contentType: 'image/webp', cacheControl: '31536000', upsert: false,
        })
        if (uploadError) return json({ error: uploadError.message }, 400)
        uploadedPaths.push(imagePath)
        image = supabase.storage.from(bucket).getPublicUrl(imagePath).data.publicUrl
      }
      nextItems.push({ id, title, text, image, imagePath })
    }

    const { data: state, error: saveError } = await supabase.from('mg3_secrets_state')
      .upsert({ id: true, items: nextItems, updated_at: new Date().toISOString() })
      .select('*').single()
    if (saveError) {
      if (uploadedPaths.length) await supabase.storage.from(bucket).remove(uploadedPaths)
      return json({ error: saveError.message }, 400)
    }
    const retainedPaths = new Set(nextItems.map((item) => item.imagePath).filter((path): path is string => typeof path === 'string'))
    const removedPaths = previousItems.map((item) => item.imagePath).filter((path): path is string => typeof path === 'string' && !retainedPaths.has(path))
    if (removedPaths.length) await supabase.storage.from(bucket).remove(removedPaths)
    return json({ state })
  }

  const { data, error } = await supabase.rpc('mg3_roulette_admin_action', {
    p_action: body.action,
    p_payload: body.payload ?? {},
  })
  if (error) return json({ error: error.message }, 400)
  return json({ state: data })
})
