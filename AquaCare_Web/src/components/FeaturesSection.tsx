import { useEffect, useRef, useState } from 'react'
import { Thermometer, Droplets, Activity, Zap } from 'lucide-react'
import Tilt3D from './Tilt3D'

const FEATURES = [
  { icon: Thermometer, title: 'Nhiệt độ nước', value: '26.5', unit: '°C', desc: 'Ngưỡng an toàn (24-28°C). Giám sát 24/7, tự động điều hòa nhiệt độ ao nuôi.', color: '#FF8C42' },
  { icon: Activity, title: 'Nồng độ pH', value: '7.2', unit: 'pH', desc: 'Ngưỡng an toàn (6.5-7.5). Đo liên tục, tự động đề xuất điều chỉnh nước.', color: '#00A896' },
  { icon: Zap, title: 'Chỉ số TDS', value: '250', unit: 'ppm', desc: 'Ngưỡng an toàn (150-300 ppm). Kiểm soát chất lượng, tránh ô nhiễm nước.', color: '#C77DFF' },
  { icon: Droplets, title: 'Mực nước', value: 'Ổn định', unit: '', desc: 'Theo dõi mực nước liên tục, cảnh báo ngay lập tức qua App khi có dấu hiệu cạn.', color: '#4DA6FF' },
]

const F = "'Inter', sans-serif"

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="features"
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
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Giải pháp</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Giải pháp giám sát <span className="gradient-text">toàn diện</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            AquaCare cung cấp bộ công cụ IoT đầy đủ để giám sát mọi thông số quan trọng
            trong ao nuôi cá cảnh, từ chất lượng nước đến sức khỏe cá cảnh.
          </p>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="features-grid">
            {FEATURES.map((f, i) => (
              <Tilt3D key={i} intensity={10} scale={1.03}>
                <div
                  className="glass-card glass-card-hover"
                  style={{
                    padding: 28,
                    background: 'rgba(15,26,48,0.7)',
                    border: '1px solid rgba(26,45,74,0.6)',
                    opacity: vis ? 1 : 0,
                    transform: vis ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 600ms ease ${200 + i * 80}ms`,
                  }}
                >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${f.color}14`, border: `1px solid ${f.color}22`,
                    }}
                  >
                    <f.icon size={22} color={f.color} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, textAlign: 'right' }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: f.color }}>{f.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{f.unit}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            </Tilt3D>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center' as const, marginTop: 48,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(15px)', transition: 'all 800ms ease 700ms',
        }}>
          <a
            href="#contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 32px', borderRadius: 12,
              fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #1B4F72, #00A896)', color: '#fff',
              boxShadow: '0 4px 20px rgba(0,229,160,0.2)',
              transition: 'box-shadow 200ms, transform 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(0,229,160,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,229,160,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Tìm hiểu thêm
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
