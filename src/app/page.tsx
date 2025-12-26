import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:12}}>Kontrol Paneli</h1>
      <p style={{color:'#4b5563',marginBottom:20}}>Mesaj moderasyonu ve akış.</p>
      <div className="grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
        <Link className="card btn" href="/inbox">📥 Inbox</Link>
        <Link className="card btn" href="/groups">👥 Gruplar</Link>
      </div>
    </div>
  )
}








