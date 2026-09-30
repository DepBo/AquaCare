import { useEffect, useRef, useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, History, MessageSquare, Clock, Search, RefreshCw } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const INFO = [
  { icon: Mail, label: 'Email', value: 'contact@aquacare.vn', color: '#00A896' },
  { icon: Phone, label: 'Điện thoại', value: '+84 xxx xxx xxx', color: '#4DA6FF' },
  { icon: MapPin, label: 'Địa chỉ', value: 'TP. Hồ Chí Minh, Việt Nam', color: '#B07AFF' },
]

const F = "'Inter', sans-serif"

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 400,
  fontFamily: F,
  color: '#fff',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(26,45,74,0.5)',
  outline: 'none',
  transition: 'border-color 200ms',
}

interface SupportItem {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  message: string
  status: 'pending' | 'replied'
  staff_reply?: string
  created_at: string
}

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  // Active view tab: 'form' | 'history'
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  // History State
  const [searchEmail, setSearchEmail] = useState('')
  const [historyItems, setHistoryItems] = useState<SupportItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  // Auto fill logged in user info
  useEffect(() => {
    const infoStr = localStorage.getItem('user_info')
    if (infoStr) {
      try {
        const parsed = JSON.parse(infoStr)
        setUserInfo(parsed)
        if (parsed.full_name || parsed.name) setFullName(parsed.full_name || parsed.name)
        if (parsed.email) {
          setEmail(parsed.email)
          setSearchEmail(parsed.email)
        }
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.address) setAddress(parsed.address)

        // Query fresh address from DB if not stored in localStorage
        if (parsed.id) {
          supabase.from('users').select('address').eq('id', parsed.id).single().then(({ data }) => {
            if (data?.address) {
              setAddress(data.address)
              localStorage.setItem('user_info', JSON.stringify({ ...parsed, address: data.address }))
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Fetch support history by email or user_id
  const fetchHistory = async (targetEmail?: string) => {
    const queryEmail = (targetEmail || searchEmail || email || '').trim()
    if (!queryEmail && !userInfo?.id) return

    setLoadingHistory(true)
    setSearched(true)
    try {
      let data: SupportItem[] | null = null
      let error: any = null

      if (userInfo?.id) {
        // Authenticated user: Select directly
        const res = await supabase
          .from('support_requests')
          .select('*')
          .or(`user_id.eq.${userInfo.id}${queryEmail ? `,email.eq.${queryEmail}` : ''}`)
          .order('created_at', { ascending: false })
        data = res.data
        error = res.error
      } else if (queryEmail) {
        // Guest user (anon): Call Secure RPC function to prevent harvesting all rows
        const res = await supabase.rpc('get_support_history_by_email', { p_email: queryEmail })
        data = res.data
        error = res.error
      }

      if (error) {
        console.error('Lỗi lấy lịch sử hỗ trợ:', error)
      } else if (data) {
        setHistoryItems(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Fetch history automatically when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      const e = searchEmail || email || userInfo?.email || ''
      if (e) fetchHistory(e)
    }
  }, [activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Nội dung cần hỗ trợ!')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        message: message.trim(),
        status: 'pending',
      }

      if (userInfo?.id) {
        payload.user_id = String(userInfo.id)
        // Sync address into users table if filled
        if (address.trim()) {
          supabase.from('users').update({ address: address.trim() }).eq('id', userInfo.id).then(() => { })
          localStorage.setItem('user_info', JSON.stringify({ ...userInfo, address: address.trim() }))
        }
      }

      const { error } = await supabase.from('support_requests').insert(payload)

      if (error) {
        console.error('Lỗi khi gửi yêu cầu hỗ trợ:', error)
        if (error.message.includes('uuid') || error.code === '22P02') {
          delete payload.user_id
          const { error: retryErr } = await supabase.from('support_requests').insert(payload)
          if (!retryErr) {
            setSuccessMsg('Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Bạn có thể chuyển sang tab "Lịch sử phản hồi" để xem câu trả lời của AquaCare.')
            setMessage('')
            return
          }
          setErrorMsg(`Lỗi từ Supabase: ${retryErr.message}`)
        } else {
          setErrorMsg(`Lỗi từ Supabase: ${error.message}`)
        }
      } else {
        setSuccessMsg('Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi thành công. Bạn có thể chuyển sang tab "Lịch sử phản hồi" để xem câu trả lời của AquaCare.')
        setMessage('')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const repliedCount = historyItems.filter(i => i.status === 'replied').length

  return (
    <section
      id="contact"
      ref={ref}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', backgroundColor: '#0d1d33', fontFamily: F, scrollMarginTop: -500 }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(11,110,110,0.15), transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center' as const, marginBottom: 56,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 800ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Liên hệ & Hỗ trợ</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Bắt đầu với <span className="gradient-text">AquaCare</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Gửi yêu cầu hỗ trợ kỹ thuật hoặc xem lại câu trả lời trực tiếp từ đội ngũ hỗ trợ AquaCare.
          </p>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 40 }} className="contact-grid">
          {/* Info Side */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 800ms ease 200ms',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 24 }}>Thông tin liên hệ</h3>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16, marginBottom: 28 }}>
              {INFO.map((info, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${info.color}0E`, border: `1px solid ${info.color}1A`,
                  }}>
                    <info.icon size={16} color={info.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{info.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{
              borderRadius: 12, height: 160,
              background: 'linear-gradient(135deg, rgba(11,110,110,0.06), rgba(21,101,192,0.06))',
              border: '1px solid rgba(26,45,74,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.15)', fontSize: 13,
            }}>
              <MapPin size={16} style={{ marginRight: 8, opacity: 0.4 }} />
              Google Maps
            </div>
          </div>

          {/* Form & History Side */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(30px)', transition: 'all 800ms ease 400ms',
          }}>
            <div className="glass-card" style={{ padding: 28 }}>

              {/* Tab Navigation Switcher */}
              <div style={{
                display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)',
                padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 24
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: F, fontSize: 12.5, fontWeight: 600,
                    background: activeTab === 'form' ? 'linear-gradient(135deg, #1B4F72, #00A896)' : 'transparent',
                    color: activeTab === 'form' ? '#fff' : 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 200ms'
                  }}
                >
                  <Send size={14} /> Gửi tin nhắn mới
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: F, fontSize: 12.5, fontWeight: 600,
                    background: activeTab === 'history' ? 'linear-gradient(135deg, #1B4F72, #00A896)' : 'transparent',
                    color: activeTab === 'history' ? '#fff' : 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 200ms', position: 'relative'
                  }}
                >
                  <History size={14} /> Lịch sử & Phản hồi
                  {repliedCount > 0 && (
                    <span style={{
                      background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700,
                      padding: '1px 6px', borderRadius: 100
                    }}>
                      {repliedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* VIEW 1: FORM INPUT */}
              {activeTab === 'form' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Gửi tin nhắn hỗ trợ</h3>
                    {userInfo && (
                      <span style={{ fontSize: 11, color: '#00A896', background: 'rgba(0,168,150,0.12)', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(0,168,150,0.3)', fontWeight: 600 }}>
                        Tài khoản: {userInfo.full_name || userInfo.name || 'Khách hàng'}
                      </span>
                    )}
                  </div>

                  {successMsg && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, lineHeight: 1.5
                    }}>
                      <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' as const, gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="form-row">
                      <div>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Họ và tên</label>
                        <input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          style={inputStyle}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Email</label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          style={inputStyle}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Số điện thoại</label>
                      <input
                        type="tel"
                        placeholder="+84 xxx xxx xxx"
                        style={inputStyle}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Địa chỉ (hỗ trợ bảo trì tận nơi nếu cần)</label>
                      <input
                        type="text"
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                        style={inputStyle}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nội dung cần hỗ trợ</label>
                      <textarea
                        rows={4}
                        placeholder="Mô tả sự cố hoặc thắc mắc cần giải đáp..."
                        style={{ ...inputStyle, resize: 'none' as const }}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px 0', borderRadius: 12,
                        fontSize: 12, fontWeight: 600, fontFamily: F,
                        textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                        background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
                        border: 'none', cursor: loading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 20px rgba(0,229,160,0.2)',
                        opacity: loading ? 0.7 : 1,
                        transition: 'box-shadow 200ms, transform 200ms',
                      }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 30px rgba(0,229,160,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
                      onMouseLeave={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,160,0.2)'; e.currentTarget.style.transform = 'translateY(0)' } }}
                    >
                      {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                      {loading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 2: HISTORY & RESPONSES */}
              {activeTab === 'history' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Lịch sử & Câu trả lời từ AquaCare</h3>
                    <button
                      type="button"
                      onClick={() => fetchHistory()}
                      title="Tải lại câu trả lời mới"
                      style={{
                        background: 'transparent', border: 'none', color: '#00A896',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600
                      }}
                    >
                      <RefreshCw size={13} style={{ animation: loadingHistory ? 'spin 1s linear infinite' : 'none' }} /> Tải lại
                    </button>
                  </div>

                  {/* Email search bar if not logged in */}
                  {!userInfo && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                      <input
                        type="email"
                        placeholder="Nhập email của bạn để tra cứu..."
                        style={inputStyle}
                        value={searchEmail}
                        onChange={e => setSearchEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => fetchHistory()}
                        style={{
                          padding: '0 18px', borderRadius: 10, background: '#00A896', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                        }}
                      >
                        <Search size={14} /> Tra cứu
                      </button>
                    </div>
                  )}

                  {/* History Cards List */}
                  {loadingHistory ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang kiểm tra câu trả lời...
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div style={{
                      padding: '44px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 12,
                      border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(0, 168, 150, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12
                      }}>
                        <MessageSquare size={24} color="#00A896" style={{ opacity: 0.85 }} />
                      </div>
                      <p style={{ margin: '0 0 6px', color: '#fff', fontSize: 14.5, fontWeight: 600 }}>
                        {searched ? 'Chưa có câu hỏi nào' : 'Vui lòng nhập Email để tra cứu'}
                      </p>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: 12.5, maxWidth: 360, lineHeight: 1.5 }}>
                        Khi nhân viên CS trả lời, câu trả lời sẽ xuất hiện tại đây.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                      {historyItems.map((item) => {
                        const isReplied = item.status === 'replied'
                        return (
                          <div
                            key={item.id}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isReplied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
                                {new Date(item.created_at).toLocaleString('vi-VN')}
                              </span>
                              {isReplied ? (
                                <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCircle2 size={12} /> Đã có phản hồi
                                </span>
                              ) : (
                                <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> Đang chờ AquaCare trả lời
                                </span>
                              )}
                            </div>

                            {/* Question Sent */}
                            <div style={{ fontSize: 13.5, color: '#fff', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>CÂU HỎI CỦA BẠN:</div>
                              {item.message}
                            </div>

                            {/* Staff Reply Box */}
                            {isReplied && item.staff_reply && (
                              <div style={{
                                background: 'linear-gradient(135deg, rgba(0,168,150,0.15), rgba(2,132,199,0.15))',
                                border: '1px solid rgba(0,168,150,0.4)',
                                borderRadius: 10, padding: '14px 16px', marginTop: 2
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>
                                  <MessageSquare size={14} /> Phản hồi từ Chăm sóc khách hàng AquaCare:
                                </div>
                                <div style={{ color: '#ffffff', fontSize: 13.5, lineHeight: 1.65, fontWeight: 400 }}>
                                  {item.staff_reply}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
