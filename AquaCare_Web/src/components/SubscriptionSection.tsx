import { useEffect, useRef, useState } from 'react'
import { CheckCircle, X, ChevronRight, Zap } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

interface SubscriptionPlan {
  id: number
  name: string
  plan_type: 'free' | 'premium' | 'enterprise'
  price: number
  duration_months: number
  max_tanks: number
  smart_device_setup: boolean
  history_days: number
}

export default function SubscriptionSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })

      if (!error && data) {
        setPlans(data as SubscriptionPlan[])
      } else {
        console.error("Failed to load subscription plans", error)
      }
      setLoading(false)
    }
    fetchPlans()
  }, [])

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) + '/tháng'
  }

  return (
    <section
      id="subscriptions"
      ref={ref}
      style={{ position: 'relative', padding: '96px 0', overflow: 'hidden', backgroundColor: '#0a1628', fontFamily: F }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center' as const, marginBottom: 72,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 800ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 1, backgroundColor: '#4DA6FF' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#4DA6FF' }}>Dịch vụ</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#4DA6FF' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Các gói <span className="gradient-text">Dịch vụ & Đặc quyền</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Nâng tầm trải nghiệm nuôi cá của bạn với các gói dịch vụ tùy chỉnh. Phù hợp cho cả người mới bắt đầu và dân chơi chuyên nghiệp.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FF8C42', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }} className="subscriptions-grid">
            {plans.map((plan, i) => {
              const isPremium = plan.plan_type === 'premium'
              return (
                <div
                  key={plan.id}
                  className="glass-card"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 24,
                    padding: '40px 32px',
                    opacity: vis ? 1 : 0,
                    transform: vis ? (isPremium ? 'translateY(-16px)' : 'translateY(0)') : 'translateY(20px)',
                    transition: `all 600ms ease ${200 + i * 100}ms`,
                    backgroundColor: isPremium ? 'rgba(77, 166, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: isPremium ? '1px solid rgba(77, 166, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: isPremium ? '0 24px 64px rgba(77, 166, 255, 0.1)' : 'none'
                  }}
                >
                  {isPremium && (
                    <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #FF8C42, #FF3366)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em', boxShadow: '0 8px 16px rgba(255,51,102,0.3)' }}>
                      <Zap size={14} fill="currentColor" /> PHỔ BIẾN NHẤT
                    </div>
                  )}

                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: isPremium ? '#4DA6FF' : '#fff', margin: '0 0 12px 0' }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                        {formatPrice(plan.price).split('/')[0]}
                      </span>
                      {plan.price > 0 && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>/tháng</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckCircle size={18} color={isPremium ? '#4DA6FF' : '#5AE87D'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        Quản lý tối đa <strong>{plan.max_tanks} bể cá</strong>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckCircle size={18} color={isPremium ? '#4DA6FF' : '#5AE87D'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        Lưu lịch sử cảm biến <strong>{plan.history_days} ngày</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {plan.smart_device_setup ? (
                        <CheckCircle size={18} color={isPremium ? '#4DA6FF' : '#5AE87D'} style={{ flexShrink: 0 }} />
                      ) : (
                        <X size={18} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 14, color: plan.smart_device_setup ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', textDecoration: plan.smart_device_setup ? 'none' : 'line-through' }}>
                        Cài đặt thiết bị thông minh
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: 12,
                      border: isPremium ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      background: isPremium ? 'linear-gradient(135deg, #4DA6FF, #0066CC)' : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: F,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={e => {
                      if (isPremium) {
                        e.currentTarget.style.filter = 'brightness(1.15)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      } else {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (isPremium) {
                        e.currentTarget.style.filter = 'brightness(1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      } else {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      }
                    }}
                  >
                    Đăng ký ngay <ChevronRight size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
