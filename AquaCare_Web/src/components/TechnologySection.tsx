import { useEffect, useRef, useState } from 'react'
import { Wifi, Database, Cloud, Monitor } from 'lucide-react'

const TECH = [
  { icon: Wifi, name: 'Thiết bị giám sát', desc: 'Bộ cảm biến thông minh đặt tại ao, liên tục theo dõi chất lượng nước.', color: '#00A896' },
  { icon: Database, name: 'Bộ não xử lý', desc: 'Hệ thống tự động phân tích dữ liệu, phát hiện sớm rủi ro.', color: '#4DA6FF' },
  { icon: Cloud, name: 'Trung tâm dữ liệu', desc: 'Thông tin luôn được lưu trữ an toàn, cho phép bạn xem mọi lúc mọi nơi.', color: '#B07AFF' },
  { icon: Monitor, name: 'Ứng dụng quản lý', desc: 'Xem biểu đồ trực quan, nhận cảnh báo ngay trên điện thoại.', color: '#FF6B6B' },
]

const F = "'Inter', sans-serif"

export default function TechnologySection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.1 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="technology"
      ref={ref}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', backgroundColor: '#0a1628', fontFamily: F }}
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
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Công nghệ</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Cách AquaCare bảo vệ <span className="gradient-text">ao nuôi của bạn</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            AquaCare mang đến một hệ thống tự động, liên tục theo dõi và phân tích dữ liệu để giúp bạn an tâm quản lý ao nuôi mà không cần rành về kỹ thuật.
          </p>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="tech-grid">
          {/* Image */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 800ms ease 200ms',
          }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 40px rgba(11,110,110,0.15)', border: '1px solid rgba(0,229,160,0.1)' }}>
              <img src="/images/tech.png" alt="Kiến trúc hệ thống" style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block', aspectRatio: '16/12' }} />
            </div>
          </div>

          {/* Tech stack */}
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(30px)', transition: 'all 800ms ease 400ms',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Quy trình vận hành</h3>
            <p style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28, maxWidth: 360 }}>
              Mọi thứ diễn ra hoàn toàn tự động qua 4 bước đơn giản, đảm bảo bạn luôn làm chủ được tình trạng ao nuôi dù ở bất cứ đâu.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {TECH.map((t, i) => (
                <div key={i} className="glass-card glass-card-hover" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${t.color}10`, border: `1px solid ${t.color}20`,
                  }}>
                    <t.icon size={20} color={t.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>{t.desc}</div>
                  </div>
                  <div className="pulse-dot" style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 24 }}>
              {['Tự động hóa', 'Cảnh báo sớm', 'Giám sát 24/7', 'Dễ sử dụng'].map(tag => (
                <span key={tag} style={{
                  padding: '5px 12px', borderRadius: 8,
                  fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em',
                  color: '#00A896', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.12)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .tech-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
