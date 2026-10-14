import { useState, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import TechnologySection from './components/TechnologySection'
import HowItWorksSection from './components/HowItWorksSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
// import FishFarmGame from './pages/FishFarmGame'
import DashboardPage from './pages/DashboardPage'
import ProductsSection from './components/ProductsSection'
import SubscriptionSection from './components/SubscriptionSection'
import CartPage from './pages/CartPage'
import { CartProvider } from './contexts/CartContext'
import AdminPage from './pages/AdminPage'
import StaffPage from './pages/StaffPage'
import { clearVerifiedRole, getVerifiedRole, rememberVerifiedRole } from './authRoleCache'

const authClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

type ProtectedRole = 'admin' | 'staff' | 'customer'

function destinationForRole(actualRole: string, requestedRole: ProtectedRole) {
  const permitted = requestedRole === 'admin'
    ? actualRole === 'admin'
    : requestedRole === 'staff'
      ? actualRole === 'staff' || actualRole.startsWith('staff_')
      : actualRole === 'user' || actualRole === 'customer'
  if (permitted) return undefined
  if (actualRole === 'admin') return '/admin'
  if (actualRole === 'staff' || actualRole.startsWith('staff_')) return '/staff'
  if (actualRole === 'user' || actualRole === 'customer') return '/dashboard'
  return '/login'
}

function ProtectedPageSkeleton() {
  const dark = localStorage.getItem('dashboard_theme') !== 'light'
  const background = dark ? '#141414' : '#eaf1f5'
  const surface = dark ? '#222225' : '#fff'
  const shimmer = dark ? '#34383b' : '#dbe5ea'
  return (
    <div role="status" aria-label="Đang tải AquaCare" style={{ minHeight: '100vh', background, padding: '22px', boxSizing: 'border-box' }}>
      <style>{`@keyframes aqua-skeleton-pulse { 0%, 100% { opacity: .48 } 50% { opacity: .9 } } @media (prefers-reduced-motion: reduce) { .aqua-skeleton { animation: none !important } }`}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <img src="/logo_ngang.png" alt="AquaCare" style={{ width: 142, height: 40, objectFit: 'contain' }} />
          <div className="aqua-skeleton" style={{ width: 148, height: 18, borderRadius: 9, background: shimmer, animation: 'aqua-skeleton-pulse 1.4s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
          <div style={{ height: 150, borderRadius: 20, background: surface, padding: 24, boxSizing: 'border-box' }}>
            <div className="aqua-skeleton" style={{ width: '38%', height: 22, borderRadius: 10, background: shimmer, animation: 'aqua-skeleton-pulse 1.4s ease-in-out infinite' }} />
            <div className="aqua-skeleton" style={{ width: '62%', height: 15, borderRadius: 8, background: shimmer, marginTop: 22, animation: 'aqua-skeleton-pulse 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
            {[0, 1, 2, 3].map(item => <div key={item} style={{ height: 170, borderRadius: 20, background: surface, padding: 22, boxSizing: 'border-box' }}>
              <div className="aqua-skeleton" style={{ width: '50%', height: 16, borderRadius: 8, background: shimmer, animation: 'aqua-skeleton-pulse 1.4s ease-in-out infinite' }} />
              <div className="aqua-skeleton" style={{ width: '65%', height: 28, borderRadius: 10, background: shimmer, marginTop: 34, animation: 'aqua-skeleton-pulse 1.4s ease-in-out infinite' }} />
            </div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleRoute({ role, children }: { role: ProtectedRole; children: ReactNode }) {
  const [decision, setDecision] = useState<{ role: ProtectedRole; destination?: string } | null>(null)
  const cached = getVerifiedRole()

  useEffect(() => {
    if (getVerifiedRole()) return
    let cancelled = false
    setDecision(null)

    const checkRole = async () => {
      try {
        // The session supplies an ID for the lookup; only getUser verifies it.
        const { data: { session }, error: sessionError } = await authClient.auth.getSession()
        if (sessionError || !session) throw sessionError || new Error('No session')
        const [authResult, roleResult] = await Promise.all([
          authClient.auth.getUser(),
          authClient.from('users').select('role').eq('id', session.user.id).single(),
        ])
        const { user } = authResult.data
        const { data: profile, error: roleError } = roleResult
        if (authResult.error || !user || user.id !== session.user.id) {
          throw authResult.error || new Error('Invalid session')
        }
        if (roleError || !profile?.role) throw roleError || new Error('No role')
        if (cancelled) return

        const actualRole = profile.role as string
        rememberVerifiedRole(user.id, actualRole)
        setDecision({ role, destination: destinationForRole(actualRole, role) })
      } catch {
        if (!cancelled) setDecision({ role, destination: '/login' })
      }
    }

    void checkRole()
    return () => { cancelled = true }
  }, [role])

  const currentDecision = cached
    ? { role, destination: destinationForRole(cached.role, role) }
    : decision
  if (currentDecision?.role !== role) return <ProtectedPageSkeleton />
  if (currentDecision.destination) return <Navigate to={currentDecision.destination} replace />
  return <>{children}</>
}

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash || ((location.state as any)?.scrollTo ? `#${(location.state as any).scrollTo}` : '')
    if (!hash) return

    const targetId = hash.replace('#', '')

    const scrollToTarget = () => {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    // Cố gắng cuộn ngay lập tức
    if (scrollToTarget()) {
      // Cuộn lại lần nữa sau một chút để đảm bảo vị trí chuẩn xác sau khi DOM ổn định
      const timeout = setTimeout(scrollToTarget, 300)
      return () => clearTimeout(timeout)
    }

    // Nếu DOM chưa sẵn sàng, thử lại định kỳ trong 2 giây
    const timer = setInterval(() => {
      if (scrollToTarget()) {
        clearInterval(timer)
      }
    }, 60)

    const maxWait = setTimeout(() => {
      clearInterval(timer)
    }, 2000)

    return () => {
      clearInterval(timer)
      clearTimeout(maxWait)
    }
  }, [location.pathname, location.hash, location.state])

  return null
}

function MainPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-[#0a1628] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar scrollY={scrollY} />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ProductsSection />
      <SubscriptionSection />
      <TechnologySection />
      <HowItWorksSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

function AppRoutes() {
  useEffect(() => {
    const { data: { subscription } } = authClient.auth.onAuthStateChange((event, session) => {
      const cached = getVerifiedRole()
      if (event === 'SIGNED_OUT' || (cached && session && cached.userId !== session.user.id)) {
        clearVerifiedRole()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage onAuthenticated={rememberVerifiedRole} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/game" element={<FishFarmGame />} /> */}
        <Route path="/dashboard" element={<RoleRoute role="customer"><DashboardPage /></RoleRoute>} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<RoleRoute role="admin"><AdminPage /></RoleRoute>} />
        <Route path="/staff" element={<RoleRoute role="staff"><StaffPage /></RoleRoute>} />
      </Routes>
    </PageTransition>
  )
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToHash />
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App

