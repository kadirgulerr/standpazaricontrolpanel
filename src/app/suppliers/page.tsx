'use client'
import { useEffect, useState } from 'react'
import PanelLayout from '../../components/PanelLayout'

type Supplier = {
  id: string
  name?: string
  email?: string
  isActive?: boolean
  createdAt?: string
}

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const load = async (p: number) => {
    setLoading(true)
    try {
      const r = await fetch(`http://localhost:5000/api/suppliers?pageNumber=${p}&pageSize=20`)
      if (!r.ok) return
      const j = await r.json()
      const data = j?.data?.items || j?.data || []
      setItems(data.map((c: any) => ({ id: c.id || c.Id, name: c.name || c.Name, email: c.email || c.Email, isActive: c.isActive ?? c.IsActive, createdAt: c.createdAt || c.CreatedAt })))
      setTotalPages(j?.data?.totalPages || 1)
    } finally { setLoading(false) }
  }

  useEffect(() => { load(page) }, [page])

  return (
    <PanelLayout>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:700}}>Suppliers</div>
            <div style={{color:'#6b7280'}}>Guid, durum, oluşturulma tarihi</div>
          </div>
        </div>
        {loading ? <div className="empty">Yükleniyor...</div> : (
          <table className="table">
            <thead><tr><th>Guid</th><th>Ad</th><th>E-posta</th><th>Durum</th><th>Oluşturulma</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}>
                  <td style={{fontFamily:'ui-monospace'}}>{c.id}</td>
                  <td>{c.name || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.isActive ? 'Aktif' : 'Pasif'}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleString('tr-TR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

