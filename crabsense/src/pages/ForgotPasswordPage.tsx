import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const F = "'Inter', sans-serif"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F,
      background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 40%, #0d1d33 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -150, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,110,110,0.06) 0%, transparent 70%)' }} />

      <div style={{ width: '100%', maxWidth: 440, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Back link */}
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 12, marginBottom: 40, transition: 'color 200ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00A896'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </Link>

        {/* Card */}
        <div style={{
          padding: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: sent
                ? 'linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,229,160,0.05))'
                : 'linear-gradient(135deg, #1B4F72, #00A896)',
              boxShadow: sent ? 'none' : '0 8px 32px rgba(0,229,160,0.25)',
              transition: 'all 400ms ease',
            }}>
              {sent ? (
                <CheckCircle size={28} color="#00A896" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c-4 0-8-2-8-6 0-2 1-4 3-5l-2-3c-.5-.8.1-1.7 1-1.7h12c.9 0 1.5.9 1 1.7l-2 3c2 1 3 3 3 5 0 4-4 6-8 6z" />
                  <circle cx="9" cy="15" r="1" fill="white" /><circle cx="15" cy="15" r="1" fill="white" />
                </svg>
              )}
            </div>
          </div>

          {!sent ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Quên mật khẩu?</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
                Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com" required
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
                  Gửi link đặt lại
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Email đã được gửi!</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6, marginBottom: 8 }}>
                Chúng tôi đã gửi link đặt lại mật khẩu đến:
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#00A896', textAlign: 'center', marginBottom: 24 }}>
                {email}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
                Vui lòng kiểm tra hộp thư (bao gồm thư mục spam). Link sẽ hết hạn sau 30 phút.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => setSent(false)} style={{
                  width: '100%', padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)', transition: 'border-color 200ms, background 200ms',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  Gửi lại email
                </button>
                <Link to="/login" style={{
                  display: 'block', width: '100%', padding: '12px 0', borderRadius: 12, textAlign: 'center',
                  fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
                  boxSizing: 'border-box',
                }}>
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Bottom links */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 24 }}>
          Chưa có tài khoản?{' '}
          <Link to="/signup" style={{ color: '#00A896', textDecoration: 'none', fontWeight: 600 }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}
