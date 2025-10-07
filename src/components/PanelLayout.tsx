'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href
  return (
    <div className="panel-root">
      <aside className="panel-aside">
        <div className="brand">Stand Pazarı<br/>Control Panel</div>
        <nav className="nav">
          <Link className={`nav-item ${isActive('/inbox') ? 'active' : ''}`} href="/inbox">📥 Inbox</Link>
          <Link className={`nav-item ${isActive('/groups') ? 'active' : ''}`} href="/groups">👥 Gruplar</Link>
          <Link className={`nav-item ${isActive('/customers') ? 'active' : ''}`} href="/customers">🧑‍💼 Customers</Link>
          <Link className={`nav-item ${isActive('/suppliers') ? 'active' : ''}`} href="/suppliers">🏭 Suppliers</Link>
        </nav>
        <div className="aside-foot">v0.1.0</div>
      </aside>
      <main className="panel-main">
        <header className="panel-header">
          <div className="hdr-title">Mesaj Moderasyonu</div>
          <div className="hdr-actions">
            <span className="badge live">● Canlı</span>
          </div>
        </header>
        <section className="panel-content">{children}</section>
      </main>
    </div>
  )
}


