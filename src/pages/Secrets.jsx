import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Section from '../components/Section.jsx'
import MysteryCarousel from '../components/MysteryCarousel.jsx'
import { ADMIN_KEY_STORAGE, callAdminAction, getActiveAdminKey, setActiveAdminKey, supabase } from '../lib/supabase.js'
import './Secrets.css'

const DEFAULT_SECRETS = Array.from({ length: 5 }, (_, index) => ({
  id: `secret-${index + 1}`,
  title: `SEGREDO 0${index + 1}`,
  text: 'Uma revelação ainda está por vir.',
  image: null,
  imagePath: null,
}))

function readImageAsWebp(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const scale = Math.min(1, 1800 / image.width, 1200 / image.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Não foi possível preparar a imagem neste navegador.'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Não foi possível converter a imagem.'))
        if (blob.size > 3 * 1024 * 1024) return reject(new Error('A imagem otimizada passou do limite de 3 MB.'))
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
        reader.readAsDataURL(blob)
      }, 'image/webp', .86)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('O arquivo selecionado não é uma imagem válida.'))
    }
    image.src = objectUrl
  })
}

export default function Secrets() {
  const [items, setItems] = useState(DEFAULT_SECRETS)
  const [draftItems, setDraftItems] = useState(DEFAULT_SECRETS)
  const [current, setCurrent] = useState(0)
  const [adminKey, setAdminKey] = useState('')
  const [title, setTitle] = useState(DEFAULT_SECRETS[0].title)
  const [text, setText] = useState(DEFAULT_SECRETS[0].text)
  const [file, setFile] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('Carregando segredos…')
  const [ready, setReady] = useState(false)
  const currentRef = useRef(current)
  const dirtyRef = useRef(dirty)
  currentRef.current = current
  dirtyRef.current = dirty

  const selected = draftItems[current] ?? draftItems[0]
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : selected?.image, [file, selected?.image])

  useEffect(() => () => { if (file && previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl) }, [file, previewUrl])

  useEffect(() => {
    let alive = true
    const activeKey = getActiveAdminKey()
    if (!activeKey) return () => { alive = false }
    callAdminAction(activeKey, 'verify').then(() => {
      if (alive) setAdminKey(activeKey)
    }).catch(() => {
      window.sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setActiveAdminKey('')
    })
    return () => { alive = false }
  }, [])

  const applyItems = useCallback((value) => {
    const normalized = Array.isArray(value) && value.length ? value : DEFAULT_SECRETS
    setItems(normalized)
    if (!dirtyRef.current) {
      setDraftItems(normalized)
      const index = Math.min(currentRef.current, normalized.length - 1)
      setCurrent(index)
      const card = normalized[index]
      if (card) { setTitle(card.title); setText(card.text) }
    }
    setReady(true)
    setStatus('Segredos sincronizados em tempo real.')
  }, [])

  useEffect(() => {
    if (!supabase) {
      setStatus('Configure o Supabase para carregar os segredos compartilhados.')
      setReady(true)
      return undefined
    }
    let alive = true
    const fetchState = () => supabase.from('mg3_secrets_state').select('items').eq('id', true).single()
      .then(({ data, error }) => {
        if (!alive) return
        if (error) setStatus('Aplique a migração SQL dos segredos no projeto Supabase.')
        else applyItems(data?.items)
      })
    fetchState()
    const channel = supabase.channel('mg3-secrets-state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mg3_secrets_state' }, (payload) => {
        if (alive) applyItems(payload.new?.items)
      })
      .subscribe((channelStatus) => {
        if (!alive) return
        if (channelStatus === 'SUBSCRIBED') fetchState()
        else if (channelStatus === 'CHANNEL_ERROR') setStatus('Sem conexão em tempo real; tentando reconectar…')
      })
    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [applyItems])

  useEffect(() => {
    if (!selected) return
    setTitle(selected.title)
    setText(selected.text)
    setFile(null)
  }, [selected?.id])

  const save = async (event) => {
    event.preventDefault()
    if (!adminKey) return setMessage('Entre como administrador para editar os segredos.')
    if (!title.trim()) return setMessage('Informe um título para este segredo.')
    setBusy(true)
    setMessage('Salvando para todos…')
    try {
      const imageData = file ? await readImageAsWebp(file) : null
      const nextItems = draftItems.map((item, index) => index === current ? {
        ...item,
        title: title.trim(),
        text: text.trim(),
        ...(imageData ? { imageData } : {}),
      } : item)
      const { state } = await callAdminAction(adminKey, 'secrets_save', { items: nextItems })
      setItems(state.items)
      setDraftItems(state.items)
      setDirty(false)
      setFile(null)
      setMessage('Segredo atualizado para todos os visitantes.')
    } catch (error) {
      setMessage(error.message || 'Não foi possível salvar o segredo.')
    } finally { setBusy(false) }
  }

  const addCard = () => {
    const nextNumber = draftItems.length + 1
    const card = { id: crypto.randomUUID(), title: `SEGREDO ${String(nextNumber).padStart(2, '0')}`, text: '', image: null, imagePath: null }
    const next = [...draftItems, card]
    setDraftItems(next)
    setCurrent(next.length - 1)
    setTitle(card.title)
    setText(card.text)
    setFile(null)
    setDirty(true)
    setMessage('Novo cartão criado. Adicione imagem e texto e salve para publicar.')
  }

  const deleteCard = () => {
    if (draftItems.length <= 1) return setMessage('Mantenha pelo menos um cartão no carrossel.')
    const next = draftItems.filter((_, index) => index !== current)
    const nextIndex = Math.min(current, next.length - 1)
    setDraftItems(next)
    setCurrent(nextIndex)
    setTitle(next[nextIndex].title)
    setText(next[nextIndex].text)
    setFile(null)
    setDirty(true)
    setMessage('Cartão removido da edição. Salve para publicar a alteração.')
  }

  const markDirty = (setter) => (event) => {
    setter(event.target.value)
    setDirty(true)
    setMessage('Alterações pendentes. Salve para publicar para todos.')
  }

  const carouselItems = adminKey ? draftItems : items

  return <Section title="SEGREDOS DO MG3" subtitle="Explore as revelações e pistas do mundo de baixo.">
    <div className="secrets-page">
      {adminKey && <p className="secrets-sync-status" role="status">{status}{!ready && ' · sincronizando'}</p>}
      {carouselItems.length > 0 && <MysteryCarousel cards={carouselItems} current={Math.min(current, carouselItems.length - 1)} onSelect={setCurrent} />}
      {adminKey ? <form className="secrets-editor" onSubmit={save}>
        <div className="secrets-editor-heading">
          <div><h3>EDITOR DO CARROSSEL</h3><p>As alterações salvas aparecem para todos os visitantes.</p></div>
          <span className="secrets-admin-badge">ADMINISTRADOR</span>
        </div>
        <div className="secrets-editor-tools">
          <button className="btn" type="button" onClick={addCard} disabled={busy || draftItems.length >= 20}>+ NOVO CARTÃO</button>
          <button className="btn secrets-delete-card" type="button" onClick={deleteCard} disabled={busy || draftItems.length <= 1}>REMOVER CARTÃO</button>
        </div>
        <label htmlFor="secret-title">Título do cartão</label>
        <input id="secret-title" maxLength={80} value={title} onChange={markDirty(setTitle)} placeholder="Ex.: O sinal no horizonte" />
        <label htmlFor="secret-text">Texto da revelação</label>
        <textarea id="secret-text" maxLength={2000} rows={4} value={text} onChange={markDirty(setText)} placeholder="Escreva a pista ou revelação deste cartão…" />
        <label htmlFor="secret-image">Imagem do cartão</label>
        <input id="secret-image" type="file" accept="image/*" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setDirty(true); setMessage('Nova imagem selecionada. Salve para publicar para todos.') }} />
        {previewUrl && <img className="secrets-editor-preview" src={previewUrl} alt="Prévia da imagem do cartão" />}
        <div className="secrets-editor-actions">
          <button className="btn primary" type="submit" disabled={busy || !dirty || !ready}>{busy ? 'SALVANDO…' : 'SALVAR E PUBLICAR'}</button>
          {dirty && <button className="btn" type="button" disabled={busy} onClick={() => { setDraftItems(items); setCurrent((index) => Math.min(index, items.length - 1)); setDirty(false); setFile(null); setMessage('Edições descartadas.') }}>DESCARTAR EDIÇÕES</button>}
        </div>
        <p className="secrets-editor-message" role="status">{message}</p>
      </form> : null}
    </div>
  </Section>
}
