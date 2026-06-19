import { ArrowUp } from 'lucide-react'

const LINKS = {
  'Giải pháp': ['Giám sát nước', 'Cảm biến IoT', 'Dashboard', 'Ứng dụng mobile'],
  'Công ty': ['Giới thiệu', 'Đội ngũ', 'Công nghệ', 'Liên hệ'],
  'Hỗ trợ': ['Tài liệu', 'API Docs', 'FAQ', 'Hướng dẫn'],
}

const F = "'Inter', sans-serif"

export default function Footer() {
  return (
    <footer style={{ position: 'relative', padding: '56px 0 28px', backgroundColor: '#070f1d', fontFamily: F }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(11,110,110,0.15), transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1B4F72, #00A896)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c-4 0-8-2-8-6 0-2 1-4 3-5l-2-3c-.5-.8.1-1.7 1-1.7h12c.9 0 1.5.9 1 1.7l-2 3c2 1 3 3 3 5 0 4-4 6-8 6z" />
                  <circle cx="9" cy="15" r="1" fill="white" />
                  <circle cx="15" cy="15" r="1" fill="white" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>AQUACARE</span>
                <span style={{ fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Smart IoT Farming</span>
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 260, marginBottom: 16 }}>
              Giải pháp IoT thông minh giám sát và quản lý ao nuôi cá cảnh, nâng cao năng suất.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize: 10, fontWeight: 600, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 16 }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 200ms' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(26,45,74,0.25)', marginBottom: 20 }} />

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 AquaCare. All rights reserved.
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            style={{
              width: 34, height: 34, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(26,45,74,0.3)',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              transition: 'color 200ms, transform 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}
