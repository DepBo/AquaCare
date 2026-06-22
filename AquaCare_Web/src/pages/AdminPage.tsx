import { useNavigate } from 'react-router-dom'

const F = "'Inter', sans-serif"

export default function AdminPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('cs_auth')
    localStorage.removeItem('cs_role')
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: F,
      background: 'linear-gradient(135deg, #0a0612 0%, #130a24 40%, #1a0a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated blobs */}
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        animation: 'floatBlob1 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -150, right: -150,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(88,28,135,0.15) 0%, transparent 70%)',
        animation: 'floatBlob2 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,130,245,0.07) 0%, transparent 70%)',
        animation: 'floatBlob1 12s ease-in-out infinite reverse',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute', top: 24, right: 32,
          padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.25)',
          background: 'rgba(139,92,246,0.1)', color: 'rgba(255,255,255,0.6)',
          fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F,
          transition: 'all 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(139,92,246,0.2)'
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(139,92,246,0.1)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
        }}
      >
        Đăng xuất
      </button>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 20px 60px rgba(139,92,246,0.4)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
          marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Admin Panel
          </span>
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 800, color: '#fff',
          marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          Trang Quản Trị
        </h1>
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.35)',
          maxWidth: 400, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Khu vực dành riêng cho quản trị viên hệ thống.<br />
          Chức năng đang được phát triển.
        </p>

        {/* Feature cards */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Quản lý Users', icon: '👥' },
            { label: 'Hệ thống', icon: '⚙️' },
            { label: 'Thống kê', icon: '📊' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px 28px', borderRadius: 16,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              minWidth: 120,
              transition: 'all 200ms',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.12)'
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.06)'
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{item.label}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, color: '#8b5cf6',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(139,92,246,0.15)', padding: '2px 8px', borderRadius: 4,
              }}>
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.93); }
        }
      `}</style>
    </div>
  )
}
