'use client'
import { useEffect, useMemo, useState } from 'react'
import PanelLayout from '../../components/PanelLayout'

type Group = { key: string; count: number }

export default function Groups() {
  const [raw, setRaw] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const groups = useMemo(() => {
    const map = new Map<string, number>()
    raw.forEach(d => {
      const k = d.senderId || 'unknown'
      map.set(k, (map.get(k) || 0) + 1)
    })
    return Array.from(map.entries()).map(([key, count]) => ({ key, count })) as Group[]
  }, [raw])

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('http://localhost:5000/api/Dialog/pending')
      const list = await r.json()
      setRaw(list || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <PanelLayout>
      <div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:12}}>Gruplar</div>
        <div style={{color:'#6b7280',marginBottom:16}}>Gönderen bazlı gruplanmış bekleyenler</div>
        {loading ? <div>Yükleniyor...</div> : (
          <div className="grid" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}>
            {groups.map(g => (
              <div key={g.key} className="card" style={{padding:16}}>
                <div style={{fontWeight:700}}>{g.key.slice(0,8)}...</div>
                <div style={{color:'#6b7280'}}>Bekleyen: {g.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  )
}

