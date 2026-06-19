import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Globe } from 'lucide-react'
import Tilt3D from './Tilt3D'

const TEAM = [
  { name: 'Thành viên 1', role: 'Project Leader', desc: 'Quản lý dự án, điều phối nhóm và thiết kế kiến trúc hệ thống tổng thể.', avatar: '👨‍💼', color: '#00A896' },
  { name: 'Thành viên 2', role: 'Hardware Engineer', desc: 'Thiết kế và phát triển mạch cảm biến IoT, firmware cho ESP32.', avatar: '👨‍🔧', color: '#4DA6FF' },
  { name: 'Thành viên 3', role: 'Backend Developer', desc: 'Xây dựng hệ thống backend, API, cơ sở dữ liệu và xử lý real-time.', avatar: '👩‍💻', color: '#B07AFF' },
  { name: 'Thành viên 4', role: 'Frontend Developer', desc: 'Phát triển giao diện web dashboard và ứng dụng mobile.', avatar: '👨‍🎨', color: '#FF6B6B' },
  { name: 'Thành viên 5', role: 'AI / Data Analyst', desc: 'Phân tích dữ liệu, xây dựng mô hình AI dự đoán và cảnh báo.', avatar: '👩‍🔬', color: '#FFB347' },
  { name: 'Thành viên 6', role: 'Marketing & Growth', desc: 'Chiến lược marketing, phát triển người dùng và mở rộng thị trường.', avatar: '👩‍💼', color: '#06D6A0' },
]

const F = "'Inter', sans-serif"

export default function TeamSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  return (
    <section
      id="team"
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
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#00A896' }}>Đội ngũ</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#00A896' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Đội ngũ <span className="gradient-text">sáng lập</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            6 thành viên trẻ đầy nhiệt huyết với niềm đam mê công nghệ
            và mong muốn cách mạng hóa ngành nuôi trồng thủy sản.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="team-grid">
          {TEAM.map((m, i) => (
            <Tilt3D key={i} intensity={12} scale={1.04}>
              <div
                className="glass-card glass-card-hover"
                style={{
                  padding: 24, textAlign: 'center' as const,
                  opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 600ms ease ${300 + i * 80}ms`,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', fontSize: 28,
                  background: `linear-gradient(135deg, ${m.color}12, ${m.color}08)`,
                  border: `1px solid ${m.color}22`,
                }}>
                  {m.avatar}
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: m.color, marginBottom: 10 }}>{m.role}</div>
                <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 14px' }}>{m.desc}</p>

                {/* Social */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[ExternalLink, Globe].map((Icon, j) => (
                    <a
                      key={j}
                      href="#"
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)',
                        transition: 'background 200ms, color 200ms', textDecoration: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                    >
                      <Icon size={13} />
                    </a>
                  ))}
                </div>
              </div>
            </Tilt3D>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .team-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .team-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 769px) and (max-width: 1100px) { .team-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>
    </section>
  )
}
