import { useEffect, useRef, useState } from 'react'
import { Radio, CloudUpload, LineChart, BellRing } from 'lucide-react'

const STEPS = [
  { icon: Radio, step: '01', title: 'Thu thập dữ liệu', desc: 'Cảm biến IoT đặt trực tiếp trong ao nuôi thu thập pH, nhiệt độ, DO, độ mặn, độ đục mỗi 5 phút.', color: '#00A896' },
  { icon: CloudUpload, step: '02', title: 'Truyền lên Cloud', desc: 'Dữ liệu được truyền qua LoRa/WiFi đến trạm gốc và đẩy lên đám mây AWS IoT Core qua giao thức MQTT bảo mật.', color: '#4DA6FF' },
  { icon: LineChart, step: '03', title: 'Phân tích & xử lý', desc: 'AI engine phân tích xu hướng dữ liệu, so sánh với ngưỡng an toàn, dự đoán các rủi ro tiềm ẩn cho ao nuôi.', color: '#B07AFF' },
  { icon: BellRing, step: '04', title: 'Cảnh báo & hành động', desc: 'Gửi thông báo tức thì qua app khi phát hiện bất thường. Tự động kích hoạt thiết bị (quạt nước, máy sục khí) nếu cần.', color: '#FFB347' },
]

const F = "'Inter', sans-serif"

export default function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="howitworks"
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
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Quy trình</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Cách hệ thống <span className="gradient-text">hoạt động</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Từ cảm biến dưới nước đến dashboard trên điện thoại, AquaCare xử lý dữ liệu
            trong vài giây để bạn luôn nắm bắt tình trạng ao nuôi.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="steps-grid">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 24, textAlign: 'center' as const,
                opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 600ms ease ${300 + i * 120}ms`,
              }}
            >
              {/* Step badge */}
              <div style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 16,
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.14em',
                color: step.color, background: `${step.color}0E`, border: `1px solid ${step.color}1A`,
              }}>
                Bước {step.step}
              </div>

              {/* Icon */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${step.color}14, ${step.color}08)`,
                border: `1px solid ${step.color}20`,
              }}>
                <step.icon size={24} color={step.color} />
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 769px) and (max-width: 1024px) { .steps-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}
