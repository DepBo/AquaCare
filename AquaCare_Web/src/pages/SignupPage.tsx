import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'

const F = "'Inter', sans-serif"

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [agree, setAgree] = useState(false)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const INPUT_STYLE: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, fontSize: 13,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
    transition: 'border-color 200ms',
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
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }} className="auth-brand-panel">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,166,255,0.06) 0%, transparent 70%)' }} />

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
              <circle cx="9" cy="15" r="1" fill="white" /><circle cx="15" cy="15" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', display: 'block' }}>AQUACARE</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Smart IoT Farming</span>
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Bắt đầu hành trình <span style={{ color: '#00A896' }}>thông minh</span>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 360 }}>
          Tạo tài khoản miễn phí để trải nghiệm hệ thống giám sát ao nuôi cá cảnh IoT tiên tiến nhất.
        </p>

        {/* Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40 }}>
          {['Miễn phí 30 ngày dùng thử', 'Không cần thẻ tín dụng', 'Hỗ trợ kỹ thuật 24/7'].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,229,160,0.1)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00A896" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div style={{ width: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }} className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Tạo tài khoản</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Điền thông tin để bắt đầu</p>

          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Họ và tên</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nguyễn Văn A" style={INPUT_STYLE}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" style={INPUT_STYLE}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+84 xxx xxx xxx" style={INPUT_STYLE}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="auth-pass-row">
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"
                    style={{ ...INPUT_STYLE, paddingRight: 40 }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Xác nhận</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="••••••••" style={INPUT_STYLE}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#00A896', cursor: 'pointer', marginTop: 2 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                Tôi đồng ý với <a href="#" style={{ color: '#00A896', textDecoration: 'none' }}>Điều khoản dịch vụ</a> và <a href="#" style={{ color: '#00A896', textDecoration: 'none' }}>Chính sách bảo mật</a>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" style={{
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
              boxShadow: '0 4px 24px rgba(0,229,160,0.2)',
              transition: 'box-shadow 200ms, transform 200ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,229,160,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,160,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Tạo tài khoản
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>hoặc</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Google Signup */}
          <button style={{
            width: '100%', padding: '12px 0', borderRadius: 12, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            transition: 'border-color 200ms, background 200ms, transform 150ms',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng ký bằng Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: '#00A896', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-brand-panel { display: none !important; }
          .auth-form-panel { width: 100% !important; }
          .auth-pass-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
