import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'

const ACCOUNTS = [
  { email: 'phamlenhatminh1609@gmail.com', password: '16092005M', role: 'user' },
  { email: 'admin1@gmail.com',              password: '12345678',   role: 'admin' },
  { email: 'staff1@gmail.com',              password: '12345678',   role: 'staff' },
]

const F = "'Inter', sans-serif"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const matched = ACCOUNTS.find(
        acc => acc.email === email && acc.password === password
      )
      if (matched) {
        localStorage.setItem('cs_auth', 'true')
        localStorage.setItem('cs_role', matched.role)
        if (matched.role === 'admin') navigate('/admin')
        else if (matched.role === 'staff') navigate('/staff')
        else navigate('/dashboard')
      } else {
        setError('Email hoặc mật khẩu không đúng!')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: F,
      background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 40%, #0d1d33 100%)',
    }}>
      {/* Left - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="auth-brand-panel"
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(11,110,110,0.08) 0%, transparent 70%)',
        }} />

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 12, marginBottom: 48, transition: 'color 200ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00A896'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} /> Về trang chủ
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1B4F72, #00A896)',
            boxShadow: '0 8px 32px rgba(0,229,160,0.25)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c-4 0-8-2-8-6 0-2 1-4 3-5l-2-3c-.5-.8.1-1.7 1-1.7h12c.9 0 1.5.9 1 1.7l-2 3c2 1 3 3 3 5 0 4-4 6-8 6z" />
              <circle cx="9" cy="15" r="1" fill="white" />
              <circle cx="15" cy="15" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', display: 'block' }}>AQUACARE</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Smart IoT Farming</span>
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Chào mừng<br />trở lại! <span style={{ color: '#00A896' }}>👋</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 360 }}>
          Đăng nhập vào dashboard để theo dõi ao nuôi cá cảnh của bạn theo thời gian thực.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
          {[{ v: '24/7', l: 'Giám sát' }, { v: '99.5%', l: 'Chính xác' }, { v: '500+', l: 'Ao nuôi' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#00A896' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div style={{
        width: 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
      }}
        className="auth-form-panel"
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Đăng nhập</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
            Nhập thông tin tài khoản của bạn
          </p>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B', fontSize: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, fontSize: 13,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                    transition: 'border-color 200ms',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 40px', borderRadius: 12, fontSize: 13,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                    transition: 'border-color 200ms',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#00A896', cursor: 'pointer' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#00A896', textDecoration: 'none', transition: 'opacity 200ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: loading ? 'rgba(0,229,160,0.3)' : 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
              boxShadow: '0 4px 24px rgba(0,229,160,0.2)',
              transition: 'box-shadow 200ms, transform 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,229,160,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,160,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Đang đăng nhập...</> : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>hoặc</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Social login */}
          <div style={{ display: 'flex', gap: 12 }}>
            {['Google', 'Facebook'].map(provider => (
              <button key={provider} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, cursor: 'pointer',
                fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 200ms, background 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 28 }}>
            Chưa có tài khoản?{' '}
            <Link to="/signup" style={{ color: '#00A896', textDecoration: 'none', fontWeight: 600 }}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .auth-brand-panel { display: none !important; }
          .auth-form-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
