import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const F = "'Inter', sans-serif"
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 42px 12px 40px',
  borderRadius: 12,
  fontSize: 13,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
}

function clearLocalAuth() {
  for (const key of ['cs_auth', 'access_token', 'refresh_token', 'cs_role', 'user_info']) {
    localStorage.removeItem(key)
  }
}

export default function ForgotPasswordPage() {
  const location = useLocation()
  const isResetPage = location.pathname === '/reset-password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sent, setSent] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingRecovery, setCheckingRecovery] = useState(isResetPage)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isResetPage) return

    let active = true
    const queryParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const callbackError =
      queryParams.get('error_description') ??
      hashParams.get('error_description')
    if (callbackError) {
      setError(callbackError)
      setCheckingRecovery(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setRecoveryReady(true)
        setCheckingRecovery(false)
        setError('')
      }
    })

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (data.session) setRecoveryReady(true)
      else if (sessionError) setError(sessionError.message)
      setCheckingRecovery(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [isResetPage])

  const handleSendReset = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setLoading(true)
    setError('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: `${window.location.origin}/reset-password` },
    )
    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }
    setEmail(normalizedEmail)
    setSent(true)
  }

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (!recoveryReady) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    clearLocalAuth()
    setLoading(false)
    setCompleted(true)
  }

  const title = isResetPage ? 'Đặt mật khẩu mới' : 'Quên mật khẩu?'
  const description = isResetPage
    ? 'Tạo mật khẩu mới cho tài khoản AquaCare của bạn.'
    : 'Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F,
        background:
          'linear-gradient(135deg, #060e1a 0%, #0a1628 40%, #0d1d33 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -150, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,110,110,0.06) 0%, transparent 70%)' }} />

      <div style={{ width: '100%', maxWidth: 440, padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 12, marginBottom: 28 }}>
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </Link>

        <div style={{ padding: 40, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sent || completed ? 'rgba(0,229,160,0.10)' : 'linear-gradient(135deg, #1B4F72, #00A896)', boxShadow: sent || completed ? 'none' : '0 8px 32px rgba(0,229,160,0.25)' }}>
              {sent || completed ? (
                <CheckCircle size={28} color="#00A896" />
              ) : isResetPage ? (
                <Lock size={26} color="#fff" />
              ) : (
                <Mail size={26} color="#fff" />
              )}
            </div>
          </div>

          {completed ? (
            <SuccessState
              title="Đã cập nhật mật khẩu"
              message="Bạn có thể đăng nhập bằng mật khẩu mới."
            />
          ) : isResetPage ? (
            checkingRecovery ? (
              <StatusText message="Đang xác minh liên kết đặt lại mật khẩu..." />
            ) : !recoveryReady ? (
              <>
                <Header title="Liên kết không hợp lệ" description="Liên kết có thể đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu một email mới." />
                {error && <ErrorText message={error} />}
                <Link to="/forgot-password" style={primaryLinkStyle}>Gửi liên kết mới</Link>
              </>
            ) : (
              <>
                <Header title={title} description={description} />
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <PasswordField label="Mật khẩu mới" value={password} show={showPassword} onChange={setPassword} onToggle={() => setShowPassword(value => !value)} />
                  <PasswordField label="Xác nhận mật khẩu" value={confirmPassword} show={showPassword} onChange={setConfirmPassword} onToggle={() => setShowPassword(value => !value)} />
                  {error && <ErrorText message={error} />}
                  <SubmitButton loading={loading} label="Cập nhật mật khẩu" />
                </form>
              </>
            )
          ) : sent ? (
            <>
              <Header title="Email đã được gửi!" description="Nếu email thuộc một tài khoản AquaCare, bạn sẽ nhận được liên kết đặt lại mật khẩu." />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#00A896', textAlign: 'center', margin: '0 0 24px' }}>{email}</p>
              <button type="button" onClick={() => { setSent(false); setError('') }} style={secondaryButtonStyle}>Gửi lại email</button>
            </>
          ) : (
            <>
              <Header title={title} description={description} />
              <form onSubmit={handleSendReset} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <label style={labelStyle}>
                  EMAIL
                  <span style={{ position: 'relative', display: 'block', marginTop: 8 }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                    <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="email@example.com" required autoComplete="email" style={inputStyle} />
                  </span>
                </label>
                {error && <ErrorText message={error} />}
                <SubmitButton loading={loading} label="Gửi link đặt lại" />
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Header({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', margin: '0 0 8px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 26px' }}>{description}</p>
    </>
  )
}

function PasswordField({ label, value, show, onChange, onToggle }: { label: string; value: string; show: boolean; onChange: (value: string) => void; onToggle: () => void }) {
  return (
    <label style={labelStyle}>
      {label.toUpperCase()}
      <span style={{ position: 'relative', display: 'block', marginTop: 8 }}>
        <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} required minLength={6} autoComplete="new-password" style={inputStyle} />
        <button type="button" onClick={onToggle} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', padding: 4, display: 'flex' }}>
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{ ...primaryButtonStyle, opacity: loading ? 0.65 : 1, cursor: loading ? 'wait' : 'pointer' }}
    >
      {loading ? 'Đang xử lý...' : label}
    </button>
  )
}

function ErrorText({ message }: { message: string }) {
  return <p role="alert" style={{ margin: 0, padding: '10px 12px', borderRadius: 10, color: '#fecaca', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 12, lineHeight: 1.5 }}>{message}</p>
}

function StatusText({ message }: { message: string }) {
  return <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', margin: 0 }}>{message}</p>
}

function SuccessState({ title, message }: { title: string; message: string }) {
  return (
    <>
      <Header title={title} description={message} />
      <Link to="/login" style={primaryLinkStyle}>Đăng nhập</Link>
    </>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.48)' }
const primaryButtonStyle: React.CSSProperties = { width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff', fontFamily: F }
const primaryLinkStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '13px 0', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none', background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff', boxSizing: 'border-box' }
const secondaryButtonStyle: React.CSSProperties = { width: '100%', padding: '12px 0', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)', fontFamily: F }
