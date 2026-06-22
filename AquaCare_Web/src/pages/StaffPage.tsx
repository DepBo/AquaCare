import { useNavigate } from 'react-router-dom'

const F = "'Inter', sans-serif"

export default function StaffPage() {
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
      background: 'linear-gradient(135deg, #020f0d 0%, #041a16 40%, #062420 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated blobs */}
      <div style={{
        position: 'absolute', top: -200, right: -150,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,160,0.1) 0%, transparent 70%)',
        animation: 'floatBlob1 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -100,
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,168,150,0.12) 0%, transparent 70%)',
        animation: 'floatBlob2 11s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '8%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        animation: 'floatBlob1 14s ease-in-out infinite reverse',
      }} />

      {/* Dot grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(0,229,160,0.06) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute', top: 24, right: 32,
          padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(0,229,160,0.2)',
          background: 'rgba(0,229,160,0.08)', color: 'rgba(255,255,255,0.6)',
          fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F,
          transition: 'all 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,229,160,0.15)'
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = 'rgba(0,229,160,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,229,160,0.08)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.borderColor = 'rgba(0,229,160,0.2)'
        }}
      >
        Đăng xuất
      </button>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'linear-gradient(135deg, #065f46, #00A896)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 20px 60px rgba(0,168,150,0.35)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)',
          marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 8px #00e5a0' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#00e5a0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Staff Portal
          </span>
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 800, color: '#fff',
          marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          Trang Nhân Viên
        </h1>
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.35)',
          maxWidth: 400, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Khu vực dành riêng cho nhân viên hệ thống.<br />
          Chức năng đang được phát triển.
        </p>

        {/* Feature cards */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Ao nuôi', icon: '🐟' },
            { label: 'Báo cáo', icon: '📋' },
            { label: 'Lịch trực', icon: '📅' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px 28px', borderRadius: 16,
              background: 'rgba(0,229,160,0.04)',
              border: '1px solid rgba(0,229,160,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              minWidth: 120,
              transition: 'all 200ms',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,229,160,0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,229,160,0.22)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,229,160,0.04)'
                e.currentTarget.style.borderColor = 'rgba(0,229,160,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{item.label}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, color: '#00A896',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(0,168,150,0.12)', padding: '2px 8px', borderRadius: 4,
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
