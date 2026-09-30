import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/game" element={<FishFarmGame />} /> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/staff" element={<StaffPage />} />
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

