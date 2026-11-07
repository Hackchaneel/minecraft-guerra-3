import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { callAdminAction, getActiveAdminKey, supabase } from '../lib/supabase.js'

const DEFAULT_ANNOUNCEMENTS = [{
  id: 'story-chapters',
  text: 'Capítulos novos da História Disponíveis!!',
  href: '/historia',
  icon: '📕',
  cta: 'LER AGORA →',
}]

function AnnouncementCard({ item }) {
  const content = <>
    <span className="story-announcement-icon" aria-hidden="true">{item.icon || '📢'}</span>
    <span>{item.text}</span>
    {item.cta && <strong>{item.cta}</strong>}
  </>
  if (item.href?.startsWith('/')) return <Link className="story-announcement" to={item.href}>{content}</Link>
  if (item.href) return <a className="story-announcement" href={item.href} target="_blank" rel="noreferrer">{content}</a>
  return <div className="story-announcement">{content}</div>
}

export default function HomeAnnouncements() {
  const [items, setItems] = useState(DEFAULT_ANNOUNCEMENTS)
  const [draft, setDraft] = useState(DEFAULT_ANNOUNCEMENTS)
  const [adminKey, setAdminKey] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty

  useEffect(() => {
    let alive = true
    const key = getActiveAdminKey()
    if (!key) return () => { alive = false }
    callAdminAction(key, 'verify').then(() => { if (alive) setAdminKey(key) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const applyItems = useCallback((value) => {
    const normalized = Array.isArray(value) ? value : DEFAULT_ANNOUNCEMENTS
    setItems(normalized)
    if (!dirtyRef.current) setDraft(normalized)
  }, [])

  useEffect(() => {
    if (!supabase) return undefined
    let alive = true
    const fetchItems = () => supabase.from('mg3_announcements_state').select('items').eq('id', true).single()
      .then(({ data, error }) => { if (alive && !error) applyItems(data?.items) })
    fetchItems()
    const channel = supabase.channel('mg3-announcements-state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mg3_announcements_state' }, (payload) => {
        if (alive) applyItems(payload.new?.items)
      })
      .subscribe((state) => { if (state === 'SUBSCRIBED') fetchItems() })
    return () => { alive = false; supabase.removeChannel(channel) }
  }, [applyItems])

  const update = (index, field, value) => {
    setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
    setDirty(true)
    setMessage('Alterações pendentes. Salve para publicar para todos.')
  }

  const add = () => {
    if (draft.length >= 12) return setMessage('Você pode criar até 12 avisos.')
    setDraft((current) => [...current, { id: crypto.randomUUID(), text: '', href: '', icon: '📢', cta: '' }])
    setDirty(true)
    setMessage('Novo aviso criado. Escreva o texto e salve para publicar.')
  }

  const remove = (index) => {
    setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setDirty(true)
    setMessage('Aviso removido da edição. Salve para publicar a remoção.')
  }

  const save = async (event) => {
    event.preventDefault()
    if (!adminKey) return
    if (draft.some((item) => !item.text.trim())) return setMessage('Preencha o texto de todos os avisos ou remova os que estão vazios.')
    setBusy(true)
    setMessage('Publicando avisos…')
    try {
      const { state } = await callAdminAction(adminKey, 'announcements_save', { items: draft })
      setItems(state.items)
      setDraft(state.items)
      setDirty(false)
      setMessage('Avisos atualizados para todos os visitantes.')
    } catch (error) {
      setMessage(error.message || 'Não foi possível salvar os avisos.')
    } finally { setBusy(false) }
  }

  return <>
    <div className="home-announcements" aria-label="Avisos">
      {items.map((item) => <AnnouncementCard key={item.id} item={item} />)}
    </div>
    {adminKey && <form className="announcements-editor" onSubmit={save}>
      <div className="announcements-editor-heading">
        <div><h3>GERENCIAR AVISOS</h3><p>Os avisos publicados aparecem para todos os visitantes.</p></div>
        <span className="secrets-admin-badge">ADMINISTRADOR</span>
      </div>
      {draft.map((item, index) => <fieldset className="announcement-edit-card" key={item.id}>
        <legend>Aviso {index + 1}</legend>
        <label>Texto do aviso<input maxLength={140} value={item.text} onChange={(event) => update(index, 'text', event.target.value)} placeholder="Ex.: Capítulos novos da História Disponíveis!!" /></label>
        <div className="announcement-edit-row">
          <label>Ícone<input maxLength={12} value={item.icon || ''} onChange={(event) => update(index, 'icon', event.target.value)} placeholder="📢" /></label>
          <label>Texto do botão<input maxLength={30} value={item.cta || ''} onChange={(event) => update(index, 'cta', event.target.value)} placeholder="LER AGORA →" /></label>
        </div>
        <label>Link (opcional)<input maxLength={200} value={item.href || ''} onChange={(event) => update(index, 'href', event.target.value)} placeholder="/historia ou https://…" /></label>
        <button className="btn announcement-delete" type="button" disabled={busy} onClick={() => remove(index)}>EXCLUIR AVISO</button>
      </fieldset>)}
      <div className="announcements-editor-actions">
        <button className="btn" type="button" onClick={add} disabled={busy || draft.length >= 12}>+ ADICIONAR AVISO</button>
        <button className="btn primary" type="submit" disabled={busy || !dirty}>{busy ? 'SALVANDO…' : 'SALVAR E PUBLICAR'}</button>
      </div>
      <p className="announcements-editor-message" role="status">{message}</p>
    </form>}
  </>
}
