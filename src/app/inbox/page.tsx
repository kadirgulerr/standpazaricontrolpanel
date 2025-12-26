'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import PanelLayout from '../../components/PanelLayout'

type PendingDialog = {
  id: string
  threadId: string
  content: string
  createdAt: string
  isApprove: boolean
  reason: string
  senderId: string
  receiverId: string
  isRead?: boolean
}

export default function Inbox() {
  const [items, setItems] = useState<PendingDialog[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const esRef = useRef<EventSource | null>(null)
  const [status, setStatus] = useState<'all'|'pending'|'approved'|'rejected'>('all')
  const [read, setRead] = useState<'all'|'read'|'unread'>('all')
  const [search, setSearch] = useState('')

  const pageSize = 20
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])

  const fetchPage = async (p: number) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ status, read, search, pageNumber: String(p), pageSize: String(pageSize) })
      const r = await fetch(`http://localhost:5000/api/Message/messages?${qs.toString()}`)
      if (!r.ok) return
      const json = await r.json()
      const all: PendingDialog[] = (json?.data || []).map((d: any) => ({
        id: d.id,
        threadId: d.threadId,
        content: d.content,
        createdAt: d.createdAt,
        isApprove: d.isApprove === true,
        reason: d.reason || '',
        senderId: d.senderId,
        receiverId: d.receiverId,
        isRead: d.isRead,
      }))
      setTotal(Number(json?.totalCount || all.length))
      setItems(all)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPage(page) }, [page, status, read, search])

  // SSE aboneliği: onay değişince listeyi tazele
  useEffect(() => {
    const es = new EventSource('http://localhost:5000/api/Dialog/stream')
    esRef.current = es
    es.onmessage = () => { fetchPage(page) }
    es.onerror = () => {}
    return () => { es.close(); esRef.current = null }
  }, [page])

  const updateStatus = async (messageId: string, isApprove: boolean) => {
    const endpoint = `http://localhost:5000/api/Dialog/${messageId}/approve`
    try {
      if (isApprove) {
        const ok = confirm('Bu mesajı onaylamak istiyor musunuz?')
        if (!ok) return
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(true), // bool göndererek eski API ile uyumlu kal
        })
        if (!res.ok) {
          const txt = await res.text()
          alert(`Onay başarısız: ${txt || res.status}`)
          return
        }
        alert('Mesaj onaylandı')
        return
      }
  
      const reason = prompt('Reddetme sebebi:') || ''
      // Önce REST endpoint ile reddetme sebebini kaydet
      const restRes = await fetch(`http://localhost:5000/api/Message/message/${messageId}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApprove: false, reason }),
      })
      if (!restRes.ok) {
        const txt = await restRes.text()
        alert(`Reddetme başarısız: ${txt || restRes.status}`)
        return
      }
      // Ardından SSE tetiklemek için bool false gönder
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(false),
      })
      if (!res.ok) {
        const txt = await res.text()
        alert(`Bildirim gönderilemedi: ${txt || res.status}`)
        return
      }
      alert('Mesaj reddedildi')
    } catch (err) {
      console.error('updateStatus error', err)
      alert('İşlem sırasında bir hata oluştu')
    }
  }

  return (
    <PanelLayout>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:700}}>Inbox</div>
            <div style={{color:'#6b7280'}}>Onay bekleyen mesajlar</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} className="btn" style={{padding:'8px 12px'}} />
            <select className="btn" value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option value="all">Durum: Hepsi</option>
              <option value="pending">Bekleyen</option>
              <option value="approved">Onaylı</option>
              <option value="rejected">Reddedilen</option>
            </select>
            <select className="btn" value={read} onChange={e=>setRead(e.target.value as any)}>
              <option value="all">Okuma: Hepsi</option>
              <option value="unread">Okunmayan</option>
              <option value="read">Okunan</option>
            </select>
          </div>
        </div>
        {loading ? <div className="empty">Yükleniyor...</div> : (
          items.length === 0 ? (
            <div className="empty">Gösterilecek mesaj yok</div>
          ) : (
            <table className="table">
            <thead>
              <tr>
                <th>Mesaj</th>
                <th>Gönderen</th>
                <th>Alıcı</th>
                <th>Proje</th>
                <th>Durum</th>
                <th>Oluşturulma</th>
                <th>İşlem</th>
              </tr>
            </thead>
              <tbody>
                {items.map(i => {
                  const status = i.isApprove ? 'Onaylı' : (i.reason ? 'Reddedildi' : 'Bekliyor')
                  return (
                  <tr key={i.id} style={{opacity: i.isRead ? 1 : .7}}>
                    <td title={i.content} style={{maxWidth:440,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.content}</td>
                    <td style={{width:160,fontFamily:'ui-monospace'}}>{(i.senderId||'').slice(0,8)}...</td>
                    <td style={{width:160,fontFamily:'ui-monospace'}}>{(i.receiverId||'').slice(0,8)}...</td>
                    <td style={{width:160,fontFamily:'ui-monospace'}}>{(i.threadId||'').slice(0,8)}...</td>
                    <td style={{width:160}}>
                      {status === 'Onaylı' && <span className="badge" style={{background:'#ecfdf5',borderColor:'#a7f3d0',color:'#166534'}}>Onaylı</span>}
                      {status === 'Reddedildi' && <span className="badge" style={{background:'#fef2f2',borderColor:'#fecaca',color:'#991b1b'}}>Reddedildi</span>}
                      {status === 'Bekliyor' && <span className="badge" style={{background:'#fff7ed',borderColor:'#fed7aa',color:'#9a3412'}}>Bekliyor</span>}
                      {i.reason && (
                        <div style={{marginTop:6,color:'#6b7280',fontSize:12}}>Sebep: {i.reason}</div>
                      )}
                    </td>
                    <td style={{width:160}}>{new Date(i.createdAt).toLocaleString('tr-TR')}</td>
                    <td style={{width:200}}>
                      <div className="actions">
                        <button className="btn" onClick={() => updateStatus(i.id, false)}>Reddet</button>
                        <button className="btn btn-primary" onClick={() => updateStatus(i.id, true)}>Onayla</button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )
        )}
        <div style={{display:'flex',gap:8,marginTop:16,alignItems:'center'}}>
          <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Önceki</button>
          <div>Sayfa {page} / {totalPages}</div>
          <button className="btn" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Sonraki</button>
        </div>
      </div>
    </PanelLayout>
  )
}

