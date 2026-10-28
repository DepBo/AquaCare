import { useRef, useState } from 'react'
import { Maximize2, PlayCircle } from 'lucide-react'

const VIDEO_SRC = '/videos/AquaCare_UserGuide.mp4'

export default function GuideSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [speed, setSpeed] = useState(1)
  const [videoError, setVideoError] = useState(false)

  const changeSpeed = (value: number) => {
    setSpeed(value)
    if (videoRef.current) videoRef.current.playbackRate = value
  }

  const enterFullscreen = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (video.requestFullscreen) await video.requestFullscreen()
      else if ('webkitEnterFullscreen' in video) {
        (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen()
      }
    } catch (error) {
      console.error('Không thể mở video toàn màn hình:', error)
    }
  }

  return (
    <section id="guide" aria-labelledby="guide-title" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0e2034 100%)', padding: '88px 24px 104px', scrollMarginTop: 76 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14, color: '#31c7bc', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <PlayCircle size={16} aria-hidden="true" /> Hướng dẫn sử dụng
          </div>
          <h2 id="guide-title" style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.2, fontWeight: 750, marginBottom: 12 }}>
            Bắt đầu cùng <span className="gradient-text">AquaCare</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15, lineHeight: 1.7, maxWidth: 650, margin: '0 auto' }}>
            Xem video hướng dẫn để làm quen với hệ thống và các bước sử dụng.
          </p>
        </div>

        <div style={{ background: '#07111d', border: '1px solid rgba(96, 211, 208, 0.18)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 22px 70px rgba(0,0,0,0.32)' }}>
          {videoError ? (
            <div role="alert" style={{ aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', padding: 24, color: '#fff', textAlign: 'center' }}>
              Không tải được video hướng dẫn. Vui lòng thử tải lại trang.
            </div>
          ) : (
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoError(true)}
              aria-label="Video hướng dẫn sử dụng AquaCare"
              style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', background: '#000' }}
            >
              Trình duyệt của bạn không hỗ trợ video HTML5.
            </video>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, padding: '14px 20px', color: '#c5d9e7' }}>
            <span style={{ fontSize: 13 }}>Dùng thanh thời gian trong video để tua đến đoạn bạn muốn xem.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                Tốc độ
                <select
                  aria-label="Tốc độ phát video"
                  value={speed}
                  onChange={event => changeSpeed(Number(event.target.value))}
                  disabled={videoError}
                  style={{ color: '#fff', background: '#142b40', border: '1px solid #35546a', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={enterFullscreen}
                disabled={videoError}
                aria-label="Phóng to video toàn màn hình"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff', background: '#087e85', border: 0, borderRadius: 8, padding: '9px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                <Maximize2 size={16} aria-hidden="true" /> Toàn màn hình
              </button>
            </div>
          </div>
        </div>

        <aside className="guide-demo-card" aria-labelledby="guide-demo-title">
          <div className="guide-demo-copy">
            <span className="guide-demo-label">Dùng thử miễn phí · 0đ</span>
            <h3 id="guide-demo-title">Trải nghiệm AquaCare trước khi chọn thiết bị</h3>
            <p>
              Thêm <strong>AquaCare V3 Demo</strong> vào giỏ hàng và hoàn tất đơn 0đ. Hệ thống sẽ gửi một mã MAC riêng đến email tài khoản của bạn. Dùng mã này để tạo bể, xem dữ liệu và thử bật/tắt thiết bị. Đây là trải nghiệm mô phỏng, không giao thiết bị vật lý.
            </p>
            <div className="guide-demo-steps" aria-label="Các bước trải nghiệm">
              <span><b>01</b> Đặt đơn 0đ</span>
              <span><b>02</b> Nhận mã qua email</span>
              <span><b>03</b> Tạo bể &amp; trải nghiệm</span>
            </div>
          </div>
          <a className="guide-demo-link" href="#product-v3-demo">Xem V3 Demo <span aria-hidden="true">↗</span></a>
        </aside>
      </div>
      <style>{`
        .guide-demo-card{margin-top:22px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:center;padding:28px 32px;border:1px solid #2c3b4d;border-radius:16px;background:#122235}
        .guide-demo-label{color:#80c8c4;font-size:12px;font-weight:700}
        .guide-demo-copy h3{color:#fff;font-size:clamp(21px,3vw,26px);line-height:1.3;margin:9px 0 10px}
        .guide-demo-copy p{color:#b9c9d5;line-height:1.7;margin:0;max-width:700px;font-size:14px}
        .guide-demo-steps{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;color:#9db6c4;font-size:12px}
        .guide-demo-steps span:not(:last-child)::after{content:'·';margin-left:8px;color:#607b8d}
        .guide-demo-steps b{color:#b8d4d6}
        .guide-demo-link{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:46px;padding:12px 18px;border:1px solid #3b7d7d;border-radius:10px;background:#176c70;color:#fff;text-decoration:none;font-size:14px;font-weight:700;white-space:nowrap;transition:background .2s ease}
        .guide-demo-link:hover,.guide-demo-link:focus-visible{background:#21878a}
        @media(max-width:720px){.guide-demo-card{grid-template-columns:minmax(0,1fr);gap:22px;padding:24px 20px}.guide-demo-link{width:100%}}
      `}</style>
    </section>
  )
}
