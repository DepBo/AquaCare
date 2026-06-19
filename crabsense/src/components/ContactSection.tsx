import { useEffect, useRef, useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

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

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="contact"
      ref={ref}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', backgroundColor: '#0d1d33', fontFamily: F }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(11,110,110,0.15), transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center' as const, marginBottom: 72,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 800ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Liên hệ</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Bắt đầu với <span className="gradient-text">AquaCare</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Liên hệ với chúng tôi để tìm hiểu thêm về giải pháp IoT giám sát ao nuôi cá cảnh
            và nhận tư vấn miễn phí cho trang trại của bạn.
          </p>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 40 }} className="contact-grid">
          {/* Info */}
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

          {/* Form */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(30px)', transition: 'all 800ms ease 400ms',
          }}>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 24 }}>Gửi tin nhắn</h3>

              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column' as const, gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="form-row">
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Email</label>
                    <input type="email" placeholder="email@example.com" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Số điện thoại</label>
                  <input type="tel" placeholder="+84 xxx xxx xxx" style={inputStyle} />
                </div>



                <div>
                  <label style={{ display: 'block', fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Nội dung</label>
                  <textarea rows={4} placeholder="Mô tả nhu cầu của bạn..." style={{ ...inputStyle, resize: 'none' as const }} />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 0', borderRadius: 12,
                    fontSize: 12, fontWeight: 600, fontFamily: F,
                    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                    background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,229,160,0.2)',
                    transition: 'box-shadow 200ms, transform 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(0,229,160,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,160,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <Send size={14} />
                  Gửi tin nhắn
                </button>
              </form>
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
