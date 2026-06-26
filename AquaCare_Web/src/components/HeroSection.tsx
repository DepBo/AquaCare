import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const SLIDES = [
  {
    src: '/images/fish1.png',
    bg: '#002233',
    sceneBg: '#0a2a2a', // dark underwater teal in the image
    accent: '#00A896',
    label: 'Giám Sát Cá Cảnh',
    desc: 'Theo dõi sức khỏe và hành vi cá cảnh theo thời gian thực qua hệ thống cảm biến IoT thông minh.',
  },
  {
    src: '/images/fish2.png',
    bg: '#0D2E5C',
    sceneBg: '#0a2040', // deep blue underwater
    accent: '#4DA6FF',
    label: 'Cảm Biến Nước',
    desc: 'Đo lường chính xác pH, nhiệt độ, độ mặn, oxy hòa tan giúp duy trì môi trường nuôi tối ưu.',
  },
  {
    src: '/images/fish3.png',
    bg: '#1A3D1F',
    sceneBg: '#0c2214', // dark green water scene
    accent: '#5AE87D',
    label: 'Trạm Giám Sát',
    desc: 'Hệ thống phao thông minh với pin mặt trời, tự động thu thập và truyền dữ liệu 24/7.',
  },
  {
    src: '/images/fish4.png',
    bg: '#1A0A3E',
    sceneBg: '#110828', // dark purple space bg
    accent: '#B07AFF',
    label: 'Bảng Điều Khiển',
    desc: 'Dashboard trực quan hiển thị mọi chỉ số ao nuôi, cảnh báo sớm rủi ro qua ứng dụng.',
  },
]

const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)'
const DUR = 400

export default function HeroSection() {
  const [idx, setIdx] = useState(0)
  const [lock, setLock] = useState(false)
  const [mobile, setMobile] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const auto = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const c = () => setMobile(window.innerWidth < 768)
    c()
    window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])

  useEffect(() => {
    SLIDES.forEach(s => { const i = new Image(); i.src = s.src })
  }, [])

  const go = useCallback((d: 'n' | 'p') => {
    if (lock) return
    setLock(true)
    setIdx(p => d === 'n' ? (p + 1) % 4 : (p + 3) % 4)
    timer.current = setTimeout(() => setLock(false), 350)
  }, [lock])

  useEffect(() => {
    auto.current = setInterval(() => go('n'), 5000)
    return () => { if (auto.current) clearInterval(auto.current) }
  }, [go])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go('n')
      else if (e.key === 'ArrowLeft') go('p')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [go])

  const roles = {
    center: idx,
    left: (idx + 3) % 4,
    right: (idx + 1) % 4,
    back: (idx + 2) % 4,
  }

  const getRole = (i: number) => {
    if (i === roles.center) return 'center'
    if (i === roles.left) return 'left'
    if (i === roles.right) return 'right'
    return 'back'
  }

  /* The only image visible should be the center one – sides are just blurred ambient shapes */
  const pos = (role: string): React.CSSProperties => {
    const t = `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}, filter ${DUR}ms ${EASE}`
    const base: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transition: t,
      willChange: 'transform, opacity, filter',
    }

    if (role === 'center') {
      return {
        ...base,
        width: mobile ? '90vw' : '52vw',
        height: mobile ? '55vh' : '90vh',
        transform: 'translate(-50%, -45%)',
        filter: 'blur(0px) brightness(1)',
        opacity: 1,
        zIndex: 20,
      }
    }
    if (role === 'left') {
      return {
        ...base,
        width: mobile ? '40vw' : '22vw',
        height: mobile ? '28vh' : '45vh',
        transform: mobile ? 'translate(-130%, -40%)' : 'translate(-180%, -35%)',
        filter: 'blur(8px) brightness(0.35)',
        opacity: 0.4,
        zIndex: 8,
      }
    }
    if (role === 'right') {
      return {
        ...base,
        width: mobile ? '40vw' : '22vw',
        height: mobile ? '28vh' : '45vh',
        transform: mobile ? 'translate(30%, -40%)' : 'translate(80%, -35%)',
        filter: 'blur(8px) brightness(0.35)',
        opacity: 0.4,
        zIndex: 8,
      }
    }
    /* back */
    return {
      ...base,
      width: mobile ? '30vw' : '18vw',
      height: mobile ? '22vh' : '35vh',
      transform: 'translate(-50%, -40%)',
      filter: 'blur(12px) brightness(0.25)',
      opacity: 0.2,
      zIndex: 4,
    }
  }

  const s = SLIDES[idx]

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── BG: radial gradient matching slide ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 90% 80% at 50% 58%, ${s.bg} 0%, #0a1628 100%)`,
          transition: `background ${DUR}ms ${EASE}`,
        }}
      />

      {/* ── Ambient glow behind center image ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 45% 55% at 50% 62%, ${s.accent}14 0%, transparent 70%)`,
          transition: `background ${DUR}ms ${EASE}`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Carousel images with strong edge-blend overlays ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
        {SLIDES.map((slide, i) => {
          const role = getRole(i)
          const style = pos(role)
          /* 
           * Strong edge feathering: use large gradient overlays (40-50% of image)
           * with the page's base dark color. The gradients use multi-stop for
           * smoother falloff so the image scene backgrounds blend away naturally.
           */
          const isCenter = role === 'center'
          /* Use EACH slide's scene background color for its overlays */
          const dark = slide.sceneBg

          return (
            <div key={i} style={{ ...style, overflow: 'hidden' }}>
              <img
                src={slide.src}
                alt={slide.label}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                  filter: 'brightness(0.65)',
                }}
              />
              {/* Full vignette overlay – covers corners that linear gradients miss */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 65% 55% at 50% 50%, transparent 30%, ${dark}90 65%, ${dark} 100%)`,
                pointerEvents: 'none',
              }} />
              {/* Top – very strong to cover scene sky */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: isCenter ? '50%' : '60%',
                background: `linear-gradient(to bottom, ${dark} 0%, ${dark}EE 15%, ${dark}90 40%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
              {/* Bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: isCenter ? '40%' : '55%',
                background: `linear-gradient(to top, ${dark} 0%, ${dark}DD 20%, ${dark}60 50%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
              {/* Left */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: isCenter ? '35%' : '50%',
                background: `linear-gradient(to right, ${dark} 0%, ${dark}CC 25%, ${dark}40 55%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
              {/* Right */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0, width: isCenter ? '35%' : '50%',
                background: `linear-gradient(to left, ${dark} 0%, ${dark}CC 25%, ${dark}40 55%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
            </div>
          )
        })}
      </div>

      {/* ── Bottom vignette (so text is readable) ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '45%',
          background: 'linear-gradient(to top, #0a1628 0%, #0a162880 40%, transparent 100%)',
          zIndex: 15,
          pointerEvents: 'none',
        }}
      />

      {/* ── Left vignette ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '35%',
          background: 'linear-gradient(to right, #0a1628CC 0%, transparent 100%)',
          zIndex: 15,
          pointerEvents: 'none',
        }}
      />

      {/* ══════════════ TEXT OVERLAY ══════════════ */}

      {/* ── Bottom-left text block ── */}
      <div
        style={{
          position: 'absolute',
          bottom: mobile ? 28 : 56,
          left: mobile ? 20 : 56,
          zIndex: 60,
          maxWidth: mobile ? 280 : 360,
        }}
      >
        {/* Accent line + subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 24,
              height: 1.5,
              backgroundColor: s.accent,
              borderRadius: 1,
              transition: `background-color ${DUR}ms ${EASE}`,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.16em',
              color: s.accent,
              transition: `color ${DUR}ms ${EASE}`,
              lineHeight: 1,
            }}
          >
            Hệ thống IoT
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: mobile ? 24 : 34,
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            margin: 0,
            marginBottom: mobile ? 8 : 12,
          }}
        >
          {s.label}
        </h1>

        {/* Description */}
        {!mobile && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75,
              margin: 0,
              marginBottom: 20,
              maxWidth: 320,
            }}
          >
            {s.desc}
          </p>
        )}

        {/* Nav row: arrows + dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Prev */}
          <button
            onClick={() => go('p')}
            aria-label="Trước"
            style={{
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: 'pointer', backdropFilter: 'blur(6px)',
              transition: 'background 150ms, transform 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          {/* Next */}
          <button
            onClick={() => go('n')}
            aria-label="Tiếp"
            style={{
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: 'pointer', backdropFilter: 'blur(6px)',
              transition: 'background 150ms, transform 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (!lock && i !== idx) { setLock(true); setIdx(i); timer.current = setTimeout(() => setLock(false), DUR) } }}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === idx ? 22 : 6, height: 6, borderRadius: 3,
                  background: i === idx ? s.accent : 'rgba(255,255,255,0.2)',
                  border: 'none', padding: 0, cursor: 'pointer',
                  transition: `width 300ms ${EASE}, background ${DUR}ms ${EASE}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom-right CTA ── */}
      <div
        style={{
          position: 'absolute',
          bottom: mobile ? 28 : 56,
          right: mobile ? 20 : 40,
          zIndex: 60,
          textAlign: 'right' as const,
        }}
      >
        <a
          href="#about"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Anton', sans-serif",
            fontSize: mobile ? 22 : 40,
            fontWeight: 400,
            color: '#fff',
            opacity: 0.85,
            textTransform: 'uppercase' as const,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            transition: 'opacity 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
        >
          KHÁM PHÁ
          <ArrowRight size={mobile ? 18 : 24} strokeWidth={2} />
        </a>
        <div
          style={{
            fontSize: 10, fontWeight: 500, color: s.accent, opacity: 0.5,
            letterSpacing: '0.06em', marginTop: 4,
            transition: `color ${DUR}ms ${EASE}`,
          }}
        >
          IoT × Nuôi trồng thủy sản
        </div>
      </div>

      {/* ── Right-side stats (xl only) ── */}
      {!mobile && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 32,
            transform: 'translateY(-50%)',
            zIndex: 55,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 12,
          }}
          className="hidden xl:flex"
        >
          {[
            // { v: '24/7', l: 'Giám sát' },
            // { v: '99%', l: 'Chính xác' },
            // { v: '5+', l: 'Cảm biến' },
            { v: '24/7', l: 'Giám sát liên tục' },
            { v: 'Tối ưu', l: 'Độ chính xác cao' },
          ].map((st, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center' as const, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)', minWidth: 70,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: s.accent, letterSpacing: '-0.02em', transition: `color ${DUR}ms ${EASE}` }}>
                {st.v}
              </div>
              <div style={{ fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: 2 }}>
                {st.l}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Scroll indicator ── */}
      {!mobile && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: 18, height: 28, borderRadius: 9,
              border: '1.5px solid rgba(255,255,255,0.15)',
              display: 'flex', justifyContent: 'center', paddingTop: 6,
            }}
          >
            <div
              style={{
                width: 3, height: 6, borderRadius: 2,
                backgroundColor: s.accent,
                animation: 'float 2s ease-in-out infinite',
                transition: `background-color ${DUR}ms ${EASE}`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
