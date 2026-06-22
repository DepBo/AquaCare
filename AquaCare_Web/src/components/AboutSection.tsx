import { useEffect, useRef, useState } from 'react'
import { Waves, Cpu, BarChart3, Shield } from 'lucide-react'
import Tilt3D from './Tilt3D'

const STATS = [
  { value: '500+', label: 'Ao nuôi giám sát' },
  { value: '99.5%', label: 'Độ chính xác' },
  { value: '24/7', label: 'Giám sát liên tục' },
  { value: '30%', label: 'Giảm tỷ lệ hao hụt' },
]

const HIGHLIGHTS = [
  { icon: Waves, title: 'Giám sát nước', desc: 'Theo dõi pH, nhiệt độ, DO, độ mặn theo thời gian thực' },
  { icon: Cpu, title: 'IoT Thông minh', desc: 'Cảm biến tự động kết nối và truyền dữ liệu liên tục' },
  { icon: BarChart3, title: 'Phân tích AI', desc: 'Dự đoán và cảnh báo sớm các rủi ro trong ao nuôi' },
  { icon: Shield, title: 'Bảo vệ cá cảnh', desc: 'Giảm thiểu tỷ lệ hao hụt, tối ưu năng suất nuôi' },
]

const F = "'Inter', sans-serif"

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.1 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={ref}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', backgroundColor: '#0a1628', fontFamily: F }}
    >
      {/* Separator */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(11,110,110,0.2), transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div
          style={{
            textAlign: 'center' as const,
            marginBottom: 72,
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 800ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>
              Giới thiệu
            </span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Công nghệ IoT cho <span className="gradient-text">nuôi cá cảnh thông minh</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            AquaCare là giải pháp giám sát ao nuôi cá cảnh toàn diện, kết hợp cảm biến IoT tiên tiến
            với phân tích dữ liệu AI, giúp người nuôi nâng cao năng suất và giảm thiểu rủi ro.
          </p>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="about-grid">
          {/* Image */}
          <div
            style={{
              position: 'relative',
              opacity: vis ? 1 : 0,
              transform: vis ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'all 800ms ease 200ms',
            }}
          >
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 30px rgba(11,110,110,0.2)' }}>
              <img
                src="/images/about_fish.png"
                alt="Ao nuôi cá cảnh AquaCare"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block', aspectRatio: '16/10' }}
              />
            </div>
          </div>

          {/* Highlight cards */}
          <div
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? 'translateX(0)' : 'translateX(30px)',
              transition: 'all 800ms ease 400ms',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {HIGHLIGHTS.map((item, i) => (
                <Tilt3D key={i} intensity={10} scale={1.03}>
                  <div className="glass-card glass-card-hover" style={{ padding: 20 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(11,110,110,0.2), rgba(0,229,160,0.12))',
                        marginBottom: 12,
                      }}
                    >
                      <item.icon size={20} color="#00A896" />
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </Tilt3D>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: 80,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            textAlign: 'center' as const,
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 800ms ease 600ms',
          }}
        >
          {STATS.map((stat, i) => (
            <div key={i}>
              <div className="gradient-text" style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
