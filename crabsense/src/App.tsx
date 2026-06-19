import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import TechnologySection from './components/TechnologySection'
import HowItWorksSection from './components/HowItWorksSection'
import TeamSection from './components/TeamSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import FishFarmGame from './pages/FishFarmGame'
import DashboardPage from './pages/DashboardPage'
import ProductsSection from './components/ProductsSection'
import CartPage from './pages/CartPage'
import { CartProvider } from './contexts/CartContext'
import AdminPage from './pages/AdminPage'
import StaffPage from './pages/StaffPage'


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
      <TechnologySection />
      <HowItWorksSection />
      <TeamSection />
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
        <Route path="/game" element={<FishFarmGame />} />
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
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
