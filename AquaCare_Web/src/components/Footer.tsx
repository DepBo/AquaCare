import { ArrowUp, Music2 } from 'lucide-react'

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
              <img src="/logo.png" alt="AquaCare" style={{
                height: 40,
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0, 168, 150, 0.3))',
              }} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>AQUACARE</span>
                <span style={{ fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Smart IoT Farming</span>
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 260, marginBottom: 16 }}>
              Giải pháp IoT thông minh giám sát và quản lý ao nuôi cá cảnh, nâng cao năng suất.
            </p>
            <section aria-label="Mạng xã hội AquaCare" style={{ marginTop: 26 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 15px' }}>Kết nối với AquaCare</h4>
              <div className="footer-social-links" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a href="https://www.facebook.com/profile.php?id=61595676521517" target="_blank" rel="noopener noreferrer" aria-label="Facebook AquaCare (mở tab mới)" className="footer-social-pill"><span className="footer-facebook-icon" aria-hidden="true">f</span>Facebook</a>
                <a href="https://www.tiktok.com/@aquacare_iotmatic?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok AquaCare (mở tab mới)" className="footer-social-pill"><Music2 size={21} className="footer-tiktok-icon" aria-hidden="true" />TikTok</a>
              </div>
            </section>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize: 10, fontWeight: 600, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 16 }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {items.map(item => (
                  <li key={item}>
                    <a
                      href={item === 'Hướng dẫn' ? '#guide' : '#'}
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
        .footer-social-pill { min-width: 136px; min-height: 42px; padding: 8px 18px; display: inline-flex; align-items: center; justify-content: center; gap: 11px; border-radius: 999px; border: 1px solid #25a9ed; background: transparent; color: #f2f7ff; text-decoration: none; font-size: 13px; font-weight: 500; box-shadow: inset 0 0 0 1px rgba(37,169,237,.08); transition: background 160ms, box-shadow 160ms, transform 160ms; }
        .footer-social-pill:hover, .footer-social-pill:focus-visible { background: rgba(37,169,237,.12); box-shadow: 0 0 14px rgba(37,169,237,.14); transform: translateY(-2px); }
        .footer-facebook-icon { width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: flex-end; justify-content: center; overflow: hidden; background: #1877f2; color: white; font: bold 23px Arial,sans-serif; line-height: 22px; }
        .footer-tiktok-icon { color: #fff; filter: drop-shadow(-2px 0 #25f4ee) drop-shadow(2px 0 #fe2c55); }
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}
