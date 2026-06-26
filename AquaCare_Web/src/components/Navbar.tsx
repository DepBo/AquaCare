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
  { label: 'Công nghệ', href: '#technology' },
  { label: 'Quy trình', href: '#howitworks' },
  { label: 'Đội ngũ', href: '#team' },
  { label: 'Liên hệ', href: '#contact' },
]

export default function Navbar({ scrollY }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCart()
  const [isAuth, setIsAuth] = useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('cs_auth'))
    setUserRole(localStorage.getItem('cs_role') || '')
  }, [])

  const isScrolled = scrollY > 60

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
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1B4F72, #00A896)',
                boxShadow: '0 4px 15px rgba(0, 229, 160, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c-4 0-8-2-8-6 0-2 1-4 3-5l-2-3c-.5-.8.1-1.7 1-1.7h12c.9 0 1.5.9 1 1.7l-2 3c2 1 3 3 3 5 0 4-4 6-8 6z" />
                <circle cx="9" cy="15" r="1" fill="white" />
                <circle cx="15" cy="15" r="1" fill="white" />
              </svg>
            </div>
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
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(link => (
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
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
                to={userRole === 'admin' ? '/admin' : userRole === 'staff' ? '/staff' : '/dashboard'}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
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
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)' }}
              >
                Dashboard
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
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 12 }}>
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
            justifyContent: 'center',
            gap: 16,
            fontFamily: "'Inter', sans-serif",
          }}
          className="lg:hidden"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
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
