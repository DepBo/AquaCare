import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
interface NavbarProps {
  scrollY: number
}

const NAV_LINKS = [
  { label: 'Trang chủ', href: '#hero' },
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Giải pháp', href: '#features' },
  { label: 'Sản phẩm', href: '#products' },
  { label: 'Hướng dẫn', href: '#guide' },
  { label: 'Gói dịch vụ', href: '#subscriptions' },
  { label: 'Công nghệ', href: '#technology' },
  { label: 'Quy trình', href: '#howitworks' },
  { label: 'Liên hệ', href: '#contact' },
]

export default function Navbar({ scrollY }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showGuideHint, setShowGuideHint] = useState(() => localStorage.getItem('aquacare_guide_hint_seen') !== 'true')
  const { totalItems } = useCart()
  const [isAuth, setIsAuth] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('cs_auth'))
    setUserRole(localStorage.getItem('cs_role') || '')
    const info = localStorage.getItem('user_info')
    if (info) {
      try { setUserInfo(JSON.parse(info)) } catch(e) {}
    }
  }, [])

  const getInitialsAvatar = (name: string) => {
    if (!name) return 'U'
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }
    return words[0][0].toUpperCase()
  }

  const isScrolled = scrollY > 60
  const dismissGuideHint = () => {
    localStorage.setItem('aquacare_guide_hint_seen', 'true')
    setShowGuideHint(false)
  }

  useEffect(() => {
    if (!showGuideHint) return
    const guide = document.getElementById('guide')
    if (!guide) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        localStorage.setItem('aquacare_guide_hint_seen', 'true')
        setShowGuideHint(false)
      }
    }, { threshold: 0.2 })
    observer.observe(guide)
    return () => observer.disconnect()
  }, [showGuideHint])

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          fontFamily: "'Inter', sans-serif",
          backgroundColor: isScrolled ? 'rgba(10, 22, 40, 0.92)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(26, 45, 74, 0.4)' : '1px solid transparent',
          transition: 'all 300ms ease',
        }}
      >
        <style>{`
          .nav-more-summary { list-style: none; }
          .nav-more-summary::-webkit-details-marker { display: none; }
          .nav-more-summary:hover, .nav-more-summary:focus-visible { color: #fff !important; background: rgba(255,255,255,0.06); }
          .nav-more-menu a:hover, .nav-more-menu a:focus-visible { background: rgba(255,255,255,0.08); color: #fff !important; }
          .nav-guide-hint { position: absolute; top: calc(100% + 13px); left: 50%; transform: translateX(-50%); width: 250px; padding: 14px 34px 15px 16px; border: 1px solid #3b5d67; border-radius: 12px; background: #14283b; box-shadow: 0 10px 28px rgba(0,0,0,.3); text-transform: none; letter-spacing: normal; white-space: normal; }
          .nav-guide-hint::before { content: ''; position: absolute; top: -7px; left: calc(50% - 6px); width: 12px; height: 12px; transform: rotate(45deg); background: #14283b; border-left: 1px solid #3b5d67; border-top: 1px solid #3b5d67; }
          .nav-guide-hint strong { display: block; margin-bottom: 5px; color: #fff; font-size: 13px; }
          .nav-guide-hint p { margin: 0 0 10px; color: #b9cbd4; font-size: 12px; line-height: 1.45; }
          .nav-guide-hint a { color: #8fddd5; font-size: 12px; font-weight: 700; text-decoration: none; }
          .nav-guide-hint-close { position: absolute; top: 8px; right: 9px; border: 0; padding: 3px; background: transparent; color: #9cb2c0; cursor: pointer; }
        `}</style>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          {/* Logo */}
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="AquaCare" style={{
              height: 42,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 10px rgba(0, 168, 150, 0.35))',
            }} />
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', display: 'block', lineHeight: 1.2 }}>
                AQUACARE
              </span>
              <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block' }}>
                Smart IoT Farming
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden xl:flex" style={{ alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(link => link.href === '#howitworks' ? null : link.href === '#technology' ? (
              <details key="more" style={{ position: 'relative' }}>
                <summary className="nav-more-summary" style={{ padding: '7px 10px', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Tìm hiểu ▾
                </summary>
                <div className="nav-more-menu" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, minWidth: 160, padding: 6, background: '#102238', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, boxShadow: '0 15px 32px rgba(0,0,0,0.3)' }}>
                  {[{ label: 'Công nghệ', href: '#technology' }, { label: 'Quy trình', href: '#howitworks' }].map(item => (
                    <a key={item.href} href={item.href} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}
                      style={{ display: 'block', padding: '10px 12px', color: 'rgba(255,255,255,0.72)', fontSize: 11, textDecoration: 'none', borderRadius: 7, whiteSpace: 'nowrap' }}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </details>
            ) : link.href === '#guide' ? (
              <div key={link.href} style={{ position: 'relative' }}>
                <a href={link.href} onClick={dismissGuideHint} style={{ display: 'block', padding: '7px 10px', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: 8, whiteSpace: 'nowrap' }}>{link.label}</a>
                {showGuideHint && scrollY < 240 && (
                  <div className="nav-guide-hint" role="note" aria-label="Gợi ý xem hướng dẫn">
                    <button className="nav-guide-hint-close" type="button" aria-label="Đóng gợi ý" onClick={dismissGuideHint}><X size={15} /></button>
                    <strong>Mới dùng AquaCare?</strong>
                    <p>Xem video hướng dẫn để bắt đầu dễ dàng hơn.</p>
                    <a href="#guide" onClick={dismissGuideHint}>Xem hướng dẫn →</a>
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: '7px 10px',
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  borderRadius: 8,
                  transition: 'color 200ms, background 200ms',
                  whiteSpace: 'nowrap' as const,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden xl:flex" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* <Link
              to="/game"
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                textDecoration: 'none',
                color: '#FFB347',
                border: '1px solid rgba(255,183,71,0.2)',
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', gap: 4,
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,183,71,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,183,71,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,183,71,0.2)' }}
            >
              🎮 Mini Game
            </Link> */}

            {/* Cart Icon */}
            <Link
              to="/cart"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', padding: '8px', color: '#fff', textDecoration: 'none',
                transition: 'transform 200ms',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  backgroundColor: '#FF6B6B', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'translate(25%, -25%)'
                }}>
                  {totalItems}
                </div>
              )}
            </Link>

            {isAuth ? (
              <Link
                to={userRole === 'admin' ? '/admin' : userRole.startsWith('staff') ? '/staff' : '/dashboard'}
                style={{
                  padding: '5px 14px 5px 6px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  color: '#fff',
                  border: '1px solid rgba(0,229,160,0.4)',
                  background: 'rgba(0,229,160,0.1)',
                  transition: 'all 200ms',
                  whiteSpace: 'nowrap' as const,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)' }}
              >
                {userInfo?.avatar_url ? (
                  <img src={userInfo.avatar_url} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(0,229,160,0.5)' }} />
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B4F72, #00A896)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    border: '1.5px solid rgba(0,229,160,0.5)'
                  }}>
                    {getInitialsAvatar(userInfo?.full_name || userInfo?.name || '')}
                  </div>
                )}
                Trang Chủ
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'color 200ms, border-color 200ms',
                  whiteSpace: 'nowrap' as const,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                Đăng nhập
              </Link>
            )}
            <a
              href="#contact"
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #1B4F72, #00A896)',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(0, 229, 160, 0.25)',
                transition: 'box-shadow 200ms, transform 200ms',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 229, 160, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 229, 160, 0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Liên hệ ngay
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex xl:hidden" style={{ alignItems: 'center', gap: 12 }}>
            <Link
              to="/cart"
              style={{
                position: 'relative', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center'
              }}
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <div style={{
                  position: 'absolute', top: -5, right: -8,
                  backgroundColor: '#FF6B6B', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {totalItems}
                </div>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: 4, display: 'flex' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {showGuideHint && !mobileOpen && scrollY < 240 && (
        <div className="flex xl:hidden" role="note" aria-label="Gợi ý xem hướng dẫn" style={{ position: 'fixed', top: 76, left: 16, width: 'calc(100% - 32px)', maxWidth: 390, zIndex: 98, alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 13px', borderRadius: 12, border: '1px solid #38535e', background: '#13283a', boxShadow: '0 8px 20px rgba(0,0,0,.25)', fontFamily: "'Inter', sans-serif" }}>
          <span style={{ color: '#d1dfe6', fontSize: 12, lineHeight: 1.4 }}>Mới dùng AquaCare?</span>
          <a href="#guide" onClick={dismissGuideHint} style={{ color: '#8fddd5', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none' }}>Xem hướng dẫn →</a>
          <button type="button" onClick={dismissGuideHint} aria-label="Đóng gợi ý" style={{ display: 'flex', padding: 2, border: 0, background: 'transparent', color: '#9cb2c0', cursor: 'pointer' }}><X size={17} /></button>
        </div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            backgroundColor: 'rgba(10, 22, 40, 0.98)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 16,
            overflowY: 'auto',
            padding: '88px 24px 28px',
            fontFamily: "'Inter', sans-serif",
          }}
          className="xl:hidden"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => { setMobileOpen(false); if (link.href === '#guide') dismissGuideHint() }}
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                transition: 'color 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            style={{
              marginTop: 20,
              padding: '12px 32px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #1B4F72, #00A896)',
              color: '#fff',
            }}
          >
            Liên hệ ngay
          </a>
        </div>
      )}
    </>
  )
}
