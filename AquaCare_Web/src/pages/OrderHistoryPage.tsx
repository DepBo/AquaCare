import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, ShoppingBag, Clock, CheckCircle, Truck, XCircle,
  AlertCircle, Eye, RefreshCw, Search, Copy, Check, MapPin, Phone,
  CreditCard, ShieldCheck, X, LogIn
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

export interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  device_macs?: string[] | null
}

export interface CustomerOrder {
  id: number
  user_id: string
  shipping_name: string
  shipping_phone: string
  shipping_email?: string | null
  shipping_address: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | string
  total_price: number
  payment_method?: string | null
  note?: string | null
  created_at: string
  updated_at?: string | null
  order_items?: OrderItem[]
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [cancelModalOrder, setCancelModalOrder] = useState<CustomerOrder | null>(null)

  const resolveUserId = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) return session.user.id
    } catch {
      // Fallback to localStorage below
    }
    try {
      const raw = localStorage.getItem('user_info')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.id) return String(parsed.id)
      }
    } catch {
      // Ignore parse errors
    }
    return null
  }

  const fetchOrders = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const uid = await resolveUserId()
      setUserId(uid)
      setAuthChecked(true)

      if (!uid) {
        setOrders([])
        setLoading(false)
        setRefreshing(false)
        return
      }

      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*, order_items(id, order_id, product_id, product_name, product_price, quantity, device_macs)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      setOrders((data as CustomerOrder[]) || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err?.message || 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchOrders()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '---'
    return new Date(isoString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getProductImage = (item: OrderItem) => {
    const pid = (item.product_id || '').toLowerCase()
    const pname = (item.product_name || '').toLowerCase()
    if (pid.includes('v1') || pname.includes('v1') || pname.includes('starter')) return '/images/Version1.png'
    if (pid.includes('v2') || pname.includes('v2') || pname.includes('basic')) return '/images/Version2.png'
    if (pid.includes('v3') || pname.includes('v3') || pname.includes('advanced')) return '/images/Version3.png'
    if (pid.includes('v4') || pname.includes('v4') || pname.includes('premium')) return '/images/Version4.png'
    return '/images/Version3.png'
  }

  const copyToClipboard = (text: string, orderId: number) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(orderId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId)
    try {
      const { error: cancelErr } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('status', 'pending')

      if (cancelErr) throw cancelErr

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null)
      }
      setCancelModalOrder(null)
    } catch (err: any) {
      alert('Không thể hủy đơn hàng: ' + (err?.message || 'Vui lòng liên hệ hỗ trợ.'))
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ duyệt',
          color: '#FCD34D',
          bg: 'rgba(245, 158, 11, 0.14)',
          border: 'rgba(245, 158, 11, 0.35)',
          icon: Clock
        }
      case 'confirmed':
        return {
          label: 'Đã duyệt',
          color: '#60A5FA',
          bg: 'rgba(59, 130, 246, 0.14)',
          border: 'rgba(59, 130, 246, 0.35)',
          icon: ShieldCheck
        }
      case 'shipping':
        return {
          label: 'Đang giao hàng',
          color: '#C084FC',
          bg: 'rgba(168, 85, 247, 0.14)',
          border: 'rgba(168, 85, 247, 0.35)',
          icon: Truck
        }
      case 'delivered':
        return {
          label: 'Đã hoàn tất',
          color: '#6EE7B7',
          bg: 'rgba(16, 185, 129, 0.14)',
          border: 'rgba(16, 185, 129, 0.35)',
          icon: CheckCircle
        }
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: '#FCA5A5',
          bg: 'rgba(239, 68, 68, 0.14)',
          border: 'rgba(239, 68, 68, 0.35)',
          icon: XCircle
        }
      default:
        return {
          label: status,
          color: '#9CA3AF',
          bg: 'rgba(156, 163, 175, 0.14)',
          border: 'rgba(156, 163, 175, 0.35)',
          icon: AlertCircle
        }
    }
  }

  const getPaymentLabel = (method?: string | null) => {
    if (!method || method === 'cod') return 'Thanh toán khi nhận hàng (COD)'
    if (method === 'demo') return 'V3 Demo miễn phí'
    if (method === 'transfer') return 'Chuyển khoản ngân hàng'
    return method
  }

  const metrics = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const activeOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'shipping').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total_price || 0), 0)

    return { totalOrders, pendingOrders, activeOrders, deliveredOrders, totalSpent }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeFilter !== 'all' && order.status !== activeFilter) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase().replace(/^#/, '')
        const idMatch = String(order.id).includes(q)
        const nameMatch = (order.shipping_name || '').toLowerCase().includes(q)
        const phoneMatch = (order.shipping_phone || '').includes(q)
        const addressMatch = (order.shipping_address || '').toLowerCase().includes(q)
        const itemMatch = (order.order_items || []).some(item =>
          (item.product_name || '').toLowerCase().includes(q) ||
          (Array.isArray(item.device_macs) && item.device_macs.some(m => String(m).toLowerCase().includes(q)))
        )
        return idMatch || nameMatch || phoneMatch || addressMatch || itemMatch
      }

      return true
    })
  }, [orders, activeFilter, searchQuery])

  const renderTimeline = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#FCA5A5', fontSize: 13, fontWeight: 500
        }}>
          <XCircle size={16} />
          <span>Đơn hàng này đã bị hủy.</span>
        </div>
      )
    }

    const steps = [
      { key: 'pending', label: 'Đặt đơn' },
      { key: 'confirmed', label: 'Đã duyệt' },
      { key: 'shipping', label: 'Đang giao' },
      { key: 'delivered', label: 'Hoàn tất' }
    ]

    const statusWeights: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      shipping: 3,
      delivered: 4
    }

    const currentWeight = statusWeights[status] || 1

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', margin: '12px 0 6px', padding: '0 12px'
      }}>
        <div style={{
          position: 'absolute', top: 12, left: 32, right: 32, height: 3,
          background: 'rgba(255,255,255,0.1)', zIndex: 1
        }} />
        <div style={{
          position: 'absolute', top: 12, left: 32,
          width: `${Math.min(100, Math.max(0, ((currentWeight - 1) / (steps.length - 1)) * 100))}%`,
          maxWidth: 'calc(100% - 64px)',
          height: 3,
          background: 'linear-gradient(90deg, #00A896, #4DA6FF)',
          transition: 'width 300ms ease',
          zIndex: 2
        }} />

        {steps.map((step, idx) => {
          const stepWeight = idx + 1
          const isDone = currentWeight >= stepWeight
          const isCurrent = currentWeight === stepWeight

          return (
            <div key={step.key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'relative', zIndex: 3
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: isDone ? '#00A896' : '#0f213a',
                border: `2px solid ${isDone ? '#00A896' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDone ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 11, fontWeight: 700,
                boxShadow: isCurrent ? '0 0 12px rgba(0, 168, 150, 0.5)' : 'none'
              }}>
                {isDone ? <Check size={14} strokeWidth={3} /> : stepWeight}
              </div>
              <span style={{
                fontSize: 11, fontWeight: isCurrent ? 700 : 500,
                color: isDone ? '#fff' : 'rgba(255,255,255,0.45)',
                marginTop: 6, whiteSpace: 'nowrap'
              }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a1628',
      color: '#fff',
      fontFamily: F,
      paddingTop: 64,
      paddingBottom: 80
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 28px' }}>
        {/* ── Top Navigation Bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 32
        }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 200ms'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
          >
            <ArrowLeft size={18} />
            <span>Quay lại giỏ hàng</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {userId && (
              <button
                onClick={() => fetchOrders(true)}
                disabled={loading || refreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 200ms'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                <span>Làm mới</span>
              </button>
            )}

            <Link
              to="/#products"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                borderRadius: 10, textDecoration: 'none',
                background: 'linear-gradient(135deg, #00A896, #028090)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 168, 150, 0.3)'
              }}
            >
              <ShoppingBag size={16} />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
        </div>

        {/* ── Page Heading ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: 0,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <Package size={32} color="#4DA6FF" />
            <span>Lịch sử giao dịch & Đơn hàng</span>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            Xem lại chi tiết các đơn hàng bạn đã mua và theo dõi trạng thái vận chuyển tại AquaCare.
          </p>
        </div>

        {/* ── Not Authenticated State ── */}
        {authChecked && !userId ? (
          <div style={{
            textAlign: 'center', padding: '72px 24px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 20, border: '1px dashed rgba(255,255,255,0.15)'
          }}>
            <LogIn size={56} color="#4DA6FF" style={{ margin: '0 auto 20px', opacity: 0.85 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>
              Vui lòng đăng nhập để xem lịch sử đơn hàng
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Đăng nhập bằng tài khoản khách hàng của bạn để tra cứu toàn bộ các đơn hàng đã đặt và mã thiết bị MAC được cấp.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none',
                background: '#4DA6FF', color: '#0a1628', fontSize: 15, fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <>
            {/* ── Summary Cards ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16, marginBottom: 24
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(77, 166, 255, 0.14)', color: '#4DA6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Tổng đơn hàng</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>{metrics.totalOrders}</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.14)', color: '#FCD34D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Chờ duyệt</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#FCD34D', marginTop: 2 }}>{metrics.pendingOrders}</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(96, 165, 250, 0.14)', color: '#60A5FA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Truck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Đang xử lý & Giao</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#60A5FA', marginTop: 2 }}>{metrics.activeOrders}</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.14)', color: '#6EE7B7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Tổng chi tiêu hoàn tất</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#6EE7B7', marginTop: 2 }}>{formatPrice(metrics.totalSpent)}</div>
                </div>
              </div>
            </div>

            {/* ── Filter Tabs & Search Controls ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '14px 18px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pending', label: 'Chờ duyệt' },
                  { id: 'confirmed', label: 'Đã duyệt' },
                  { id: 'shipping', label: 'Đang giao' },
                  { id: 'delivered', label: 'Đã hoàn tất' },
                  { id: 'cancelled', label: 'Đã hủy' }
                ].map(tab => {
                  const count = tab.id === 'all'
                    ? orders.length
                    : orders.filter(o => o.status === tab.id).length
                  const active = activeFilter === tab.id

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as FilterStatus)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 10, border: 'none',
                        fontSize: 13, fontWeight: active ? 700 : 500,
                        cursor: 'pointer', transition: 'all 160ms ease',
                        background: active ? '#00A896' : 'rgba(255,255,255,0.05)',
                        color: active ? '#fff' : 'rgba(255,255,255,0.65)'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        fontSize: 11, padding: '1px 7px', borderRadius: 20,
                        background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#fff' : 'rgba(255,255,255,0.5)'
                      }}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
                <Search size={16} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)'
                }} />
                <input
                  type="text"
                  placeholder="Tìm mã đơn (#39), sản phẩm, MAC..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 32px 9px 36px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0,0,0,0.25)', color: '#fff',
                    fontSize: 13, outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.5)', padding: 4
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Orders Content ── */}
            {loading ? (
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.07)'
              }}>
                <RefreshCw size={34} color="#4DA6FF" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 16, fontWeight: 700 }}>Đang tải lịch sử đơn hàng...</div>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(239, 68, 68, 0.06)', borderRadius: 20,
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}>
                <AlertCircle size={42} color="#FCA5A5" style={{ margin: '0 auto 14px' }} />
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Không thể tải lịch sử đơn hàng</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{error}</div>
                <button
                  onClick={() => fetchOrders()}
                  style={{
                    padding: '9px 22px', borderRadius: 10, border: 'none',
                    background: '#00A896', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20,
                border: '1px dashed rgba(255,255,255,0.12)'
              }}>
                <ShoppingBag size={60} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: '0 0 10px' }}>
                  {orders.length === 0 ? 'Chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng phù hợp'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 auto 28px', maxWidth: 420 }}>
                  {orders.length === 0
                    ? 'Bạn chưa từng đặt mua thiết bị nào tại AquaCare. Hãy khám phá các bộ giải pháp thông minh của chúng tôi!'
                    : 'Hãy thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.'}
                </p>
                {orders.length === 0 ? (
                  <Link
                    to="/#products"
                    style={{
                      display: 'inline-block', padding: '12px 28px', borderRadius: 12,
                      background: '#4DA6FF', color: '#0a1628', fontWeight: 700, fontSize: 14,
                      textDecoration: 'none'
                    }}
                  >
                    Mua sắm ngay
                  </Link>
                ) : (
                  <button
                    onClick={() => { setActiveFilter('all'); setSearchQuery('') }}
                    style={{
                      padding: '10px 22px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.06)', color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {filteredOrders.map(order => {
                  const badge = getStatusBadge(order.status)
                  const BadgeIcon = badge.icon
                  const totalQty = (order.order_items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)

                  const allMacs: string[] = []
                  ;(order.order_items || []).forEach(item => {
                    if (Array.isArray(item.device_macs)) {
                      item.device_macs.forEach(m => { if (m) allMacs.push(String(m)) })
                    }
                  })

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 20,
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        cursor: 'pointer',
                        transition: 'transform 200ms, border-color 200ms, background-color 200ms'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.045)'
                        e.currentTarget.style.borderColor = 'rgba(77,166,255,0.35)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {/* Header Row */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 12, paddingBottom: 14,
                        borderBottom: '1px solid rgba(255,255,255,0.07)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Đơn hàng
                            <span style={{
                              fontFamily: 'monospace', color: '#4DA6FF',
                              background: 'rgba(77,166,255,0.12)', padding: '2px 8px', borderRadius: 6
                            }}>
                              #{order.id}
                            </span>
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); copyToClipboard(String(order.id), order.id) }}
                            title="Sao chép mã đơn"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: copiedId === order.id ? '#6EE7B7' : 'rgba(255,255,255,0.4)',
                              padding: 2, display: 'flex', alignItems: 'center'
                            }}
                          >
                            {copiedId === order.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                            Đặt lúc {formatDate(order.created_at)}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 12px', borderRadius: 100,
                          background: badge.bg, border: `1px solid ${badge.border}`,
                          color: badge.color, fontSize: 12, fontWeight: 700
                        }}>
                          <BadgeIcon size={14} />
                          <span>{badge.label}</span>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      {renderTimeline(order.status)}

                      {/* Products List */}
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: 10,
                        background: 'rgba(0,0,0,0.22)', borderRadius: 14, padding: '14px 16px'
                      }}>
                        {(order.order_items || []).map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 12, flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img
                                src={getProductImage(item)}
                                alt={item.product_name}
                                onError={e => { e.currentTarget.src = '/images/Version3.png' }}
                                style={{
                                  width: 46, height: 46, borderRadius: 8, objectFit: 'cover',
                                  border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0
                                }}
                              />
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.product_name}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                                  Số lượng: <strong style={{ color: '#fff' }}>{item.quantity}</strong> × {formatPrice(item.product_price)}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#4DA6FF' }}>
                              {formatPrice((item.product_price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Assigned MACs */}
                      {allMacs.length > 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                          padding: '10px 14px', borderRadius: 10,
                          background: 'rgba(0, 168, 150, 0.1)',
                          border: '1px solid rgba(0, 168, 150, 0.28)'
                        }}>
                          <ShieldCheck size={16} color="#00A896" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                            Mã thiết bị MAC:
                          </span>
                          {allMacs.map((mac, i) => (
                            <span key={i} style={{
                              fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                              padding: '2px 8px', borderRadius: 6,
                              background: 'rgba(0, 168, 150, 0.22)', color: '#6EE7B7'
                            }}>
                              {mac}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 14, paddingTop: 6
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                            <MapPin size={14} color="rgba(255,255,255,0.4)" />
                            <span>Người nhận: <strong style={{ color: '#fff' }}>{order.shipping_name}</strong> ({order.shipping_phone})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                            <CreditCard size={13} />
                            <span>{getPaymentLabel(order.payment_method)}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 'auto' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Tổng tiền ({totalQty} sản phẩm)</div>
                            <div style={{ fontSize: 19, fontWeight: 800, color: '#5AE87D' }}>
                              {formatPrice(order.total_price)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {order.status === 'pending' && (
                              <button
                                onClick={e => { e.stopPropagation(); setCancelModalOrder(order) }}
                                style={{
                                  padding: '8px 14px', borderRadius: 10,
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#FCA5A5', fontSize: 13, fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Hủy đơn
                              </button>
                            )}

                            <button
                              onClick={e => { e.stopPropagation(); setSelectedOrder(order) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', borderRadius: 10,
                                border: '1px solid rgba(77,166,255,0.35)',
                                background: 'rgba(77,166,255,0.12)',
                                color: '#4DA6FF', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={15} />
                              <span>Chi tiết</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Order Details Modal ── */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d1d35',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22, padding: '28px 30px',
              width: '100%', maxWidth: 560, maxHeight: '90vh',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              color: '#fff', display: 'flex', flexDirection: 'column', gap: 18
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.06em' }}>
                  CHI TIẾT ĐƠN HÀNG
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                  Mã đơn <span style={{ fontFamily: 'monospace', color: '#4DA6FF' }}>#{selectedOrder.id}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => {
                  const b = getStatusBadge(selectedOrder.status)
                  const Icon = b.icon
                  return (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 20,
                      background: b.bg, border: `1px solid ${b.border}`,
                      color: b.color, fontSize: 12, fontWeight: 700
                    }}>
                      <Icon size={14} />
                      <span>{b.label}</span>
                    </div>
                  )
                })()}
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: 'none',
                    borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar" style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              overflowY: 'auto', paddingRight: 4
            }}>
              {renderTimeline(selectedOrder.status)}

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>
                  THÔNG TIN NHẬN HÀNG
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Người nhận:</span>
                  <span style={{ fontWeight: 700 }}>{selectedOrder.shipping_name}</span>

                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Số điện thoại:</span>
                  <span>{selectedOrder.shipping_phone}</span>

                  {selectedOrder.shipping_email && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email:</span>
                      <span>{selectedOrder.shipping_email}</span>
                    </>
                  )}

                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Địa chỉ:</span>
                  <span style={{ lineHeight: 1.4 }}>{selectedOrder.shipping_address}</span>

                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ngày đặt:</span>
                  <span>{formatDate(selectedOrder.created_at)}</span>

                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Thanh toán:</span>
                  <span>{getPaymentLabel(selectedOrder.payment_method)}</span>

                  {selectedOrder.note && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ghi chú:</span>
                      <span style={{ color: '#FCD34D', fontStyle: 'italic' }}>"{selectedOrder.note}"</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>
                  DANH SÁCH SẢN PHẨM ({selectedOrder.order_items?.length || 0})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(selectedOrder.order_items || []).map((item, idx) => {
                    const macs = Array.isArray(item.device_macs) ? item.device_macs.filter(Boolean) : []
                    return (
                      <div key={idx} style={{
                        background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={getProductImage(item)}
                              alt={item.product_name}
                              onError={e => { e.currentTarget.src = '/images/Version3.png' }}
                              style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{item.product_name}</div>
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                Số lượng: {item.quantity} × {formatPrice(item.product_price)}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#4DA6FF', fontSize: 14 }}>
                            {formatPrice(item.product_price * item.quantity)}
                          </div>
                        </div>

                        {macs.length > 0 && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                            marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)'
                          }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Mã MAC:</span>
                            {macs.map((m, mi) => (
                              <span key={mi} style={{
                                fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                                padding: '2px 6px', borderRadius: 4,
                                background: 'rgba(0, 168, 150, 0.2)', color: '#6EE7B7'
                              }}>
                                {String(m)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 6, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.15)'
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#5AE87D' }}>
                    {formatPrice(selectedOrder.total_price)}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, background: 'rgba(77,166,255,0.08)',
                border: '1px solid rgba(77,166,255,0.2)', fontSize: 12, color: 'rgba(255,255,255,0.7)'
              }}>
                <Phone size={16} color="#4DA6FF" style={{ flexShrink: 0 }} />
                <span>Hỗ trợ đơn hàng & kỹ thuật AquaCare: <strong style={{ color: '#4DA6FF' }}>1900 6868</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => setCancelModalOrder(selectedOrder)}
                  style={{
                    padding: '11px 18px', borderRadius: 10,
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#FCA5A5', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Hủy đơn hàng
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '11px 28px', borderRadius: 10, border: 'none',
                  background: '#4DA6FF', color: '#0a1628', fontSize: 14, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {cancelModalOrder && (
        <div
          onClick={() => setCancelModalOrder(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1300,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d1d35', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '26px 28px', maxWidth: 430, width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)', color: '#fff'
            }}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800 }}>
              Hủy đơn hàng #{cancelModalOrder.id}?
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setCancelModalOrder(null)}
                disabled={cancellingId === cancelModalOrder.id}
                style={{
                  padding: '9px 18px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Giữ lại
              </button>
              <button
                onClick={() => handleCancelOrder(cancelModalOrder.id)}
                disabled={cancellingId === cancelModalOrder.id}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {cancellingId === cancelModalOrder.id ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
