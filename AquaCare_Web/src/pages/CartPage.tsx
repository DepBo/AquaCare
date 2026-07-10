import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle, CreditCard, Truck, User, MapPin, Phone, Mail, FileText, QrCode, X, Clock, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()

  const [isCheckout, setIsCheckout] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod'
  })

  const [userSession, setUserSession] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailsModal, setDetailsModal] = useState<{ show: boolean, order: any | null }>({ show: false, order: null })

  // Auto-fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserSession(session.user)
        const { data: userData } = await supabase.from('users').select('full_name, email, phone').eq('id', session.user.id).single()
        if (userData) {
          setFormData(prev => ({
            ...prev,
            fullName: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || prev.phone
          }))
        }
      }
    }
    fetchUser()
  }, [])

  const fetchHistoryOrders = async (userId: string) => {
    setHistoryLoading(true)
    const { data: ordersData, error } = await supabase.from('orders').select('*, order_items(product_name, quantity, product_price)').eq('user_id', userId).order('created_at', { ascending: false })
    if (ordersData) {
      setHistoryOrders(ordersData)
    }
    setHistoryLoading(false)
  }

  const noteWordsCount = formData.note.trim() === '' ? 0 : formData.note.trim().split(/\s+/).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'note') {
      const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
      if (words > 60 && value.length > formData.note.length) {
        return; // Prevent typing more if already at limit
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('Vui lòng đăng nhập để đặt hàng!')
      navigate('/login')
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        shipping_name: formData.fullName,
        shipping_phone: formData.phone,
        shipping_email: formData.email,
        shipping_address: formData.address,
        total_price: totalPrice,
        note: formData.note,
        payment_method: formData.paymentMethod,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      alert('Lỗi đặt hàng: ' + orderError.message)
      return
    }

    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      alert('Lỗi lưu chi tiết đơn hàng: ' + itemsError.message)
      return
    }

    setIsSuccess(true)
    clearCart()
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#fff', fontFamily: "'Inter', sans-serif", paddingTop: 120, paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <CheckCircle size={80} color="#5AE87D" style={{ margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Đặt hàng thành công!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.6 }}>
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-block', padding: '16px 32px', borderRadius: 12,
              backgroundColor: '#4DA6FF', color: '#0a1628', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
              transition: 'transform 200ms', width: '100%'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#fff', fontFamily: "'Inter', sans-serif", paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button onClick={() => showHistory ? setShowHistory(false) : isCheckout ? setIsCheckout(false) : navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 200ms', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{showHistory ? 'Quay lại giỏ hàng' : isCheckout ? 'Quay lại giỏ hàng' : 'Quay lại cửa hàng'}</span>
          </button>
          
          {userSession && !showHistory && (
            <button onClick={() => { setShowHistory(true); fetchHistoryOrders(userSession.id) }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, transition: 'background 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <FileText size={16} /> Đơn hàng của tôi
            </button>
          )}
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          {showHistory ? <FileText size={32} color="#4DA6FF" /> : isCheckout ? <CreditCard size={32} color="#FF8C42" /> : <ShoppingBag size={32} color="#FF8C42" />}
          {showHistory ? 'Đơn hàng của tôi' : isCheckout ? 'Thanh toán' : 'Giỏ hàng của bạn'}
        </h1>

        {showHistory ? (
          // History View
          historyLoading ? (
             <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.6)' }}>Đang tải lịch sử đơn hàng...</div>
          ) : historyOrders.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
               <FileText size={64} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 24px' }} />
               <h2 style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Chưa có đơn hàng nào</h2>
               <p style={{ color: 'rgba(255,255,255,0.5)' }}>Bạn chưa từng đặt hàng tại AquaCare.</p>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 850, margin: '0 auto' }}>
              {historyOrders.map(order => (
                <div key={order.id} style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  borderRadius: 20, 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: 24, 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform 200ms, background-color 200ms, border-color 200ms',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(77,166,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  onClick={() => setDetailsModal({ show: true, order })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>Đơn hàng <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>#{order.id}</span></span>
                        {order.status === 'pending'
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', color: '#FCD34D', fontSize: 12, fontWeight: 600 }}><Clock size={12} /> Đang xử lý</span>
                          : <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', fontSize: 12, fontWeight: 600 }}><CheckCircle size={12} /> Đã hoàn thành</span>
                        }
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Đặt lúc {new Date(order.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#4DA6FF', marginBottom: 4 }}>{formatPrice(order.total_price)}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{order.order_items?.length || 0} sản phẩm</div>
                    </div>
                  </div>

                  {/* A tiny preview of products */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' }}>
                      {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                         <div key={idx} style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                           <span style={{ fontWeight: 600, color: '#fff' }}>{item.quantity}x</span> {item.product_name}
                         </div>
                      ))}
                      {order.order_items?.length > 3 && (
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>+ {order.order_items.length - 3} sản phẩm khác</div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailsModal({ show: true, order }) }}
                      style={{ background: 'none', border: 'none', color: '#4DA6FF', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 200ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4DA6FF'}
                    >
                      Chi tiết <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : cart.length === 0 && !isCheckout ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <ShoppingBag size={64} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Giỏ hàng trống</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Bạn chưa chọn sản phẩm nào để thêm vào giỏ hàng.</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '12px 32px', borderRadius: 8,
              backgroundColor: '#4DA6FF', color: '#0a1628', fontWeight: 600, textDecoration: 'none',
              transition: 'transform 200ms',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }} className="cart-layout">

            {/* Left Column (Cart Items or Checkout Form) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!isCheckout ? (
                // Cart Items
                cart.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', gap: 20, padding: 20, borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    alignItems: 'center'
                  }}>
                    <div style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: '#fff' }}>{item.name}</h3>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#4DA6FF', marginBottom: 12 }}>
                        {formatPrice(item.price)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px'
                        }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                            <Minus size={16} />
                          </button>
                          <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                            <Plus size={16} />
                          </button>
                        </div>

                        <button onClick={() => removeFromCart(item.id)} style={{
                          background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: 0
                        }}>
                          <Trash2 size={16} /> Xóa
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                // Checkout Form
                <form id="checkout-form" onSubmit={handleCheckout} style={{
                  backgroundColor: 'rgba(255,255,255,0.03)', padding: 32, borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={20} color="#4DA6FF" />
                    Thông tin giao hàng
                  </h3>

                  <div style={{ display: 'grid', gap: 20 }}>
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Họ và tên</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text" name="fullName" required
                          value={formData.fullName} onChange={handleInputChange}
                          placeholder="Nhập họ và tên người nhận"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Số điện thoại</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="tel" name="phone" required
                          value={formData.phone} onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="email" name="email" required
                          value={formData.email} onChange={handleInputChange}
                          placeholder="Nhập địa chỉ email"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Địa chỉ giao hàng</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: 20, transform: 'translateY(-50%)' }} />
                        <textarea
                          name="address" required
                          value={formData.address} onChange={handleInputChange}
                          placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none', minHeight: 100, resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                        <span>Ghi chú đơn hàng</span>
                        <span style={{ color: noteWordsCount > 60 ? '#FF6B6B' : 'rgba(255,255,255,0.5)', fontWeight: noteWordsCount > 60 ? 'bold' : 'normal' }}>
                          {noteWordsCount}/60 từ
                        </span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: 20, transform: 'translateY(-50%)' }} />
                        <textarea
                          name="note"
                          value={formData.note} onChange={handleInputChange}
                          placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: `1px solid ${noteWordsCount > 60 ? '#FF6B6B' : 'rgba(255,255,255,0.1)'}`,
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none', minHeight: 80, resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative', marginTop: 8 }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>Phương thức thanh toán</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '16px', borderRadius: 12, border: `1px solid ${formData.paymentMethod === 'cod' ? '#4DA6FF' : 'rgba(255,255,255,0.1)'}`, backgroundColor: formData.paymentMethod === 'cod' ? 'rgba(77,166,255,0.05)' : 'rgba(0,0,0,0.2)' }}>
                          <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} style={{ width: 18, height: 18, accentColor: '#4DA6FF' }} />
                          <span style={{ fontSize: 15 }}>Thanh toán khi nhận hàng (COD)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '16px', borderRadius: 12, border: `1px solid ${formData.paymentMethod === 'transfer' ? '#4DA6FF' : 'rgba(255,255,255,0.1)'}`, backgroundColor: formData.paymentMethod === 'transfer' ? 'rgba(77,166,255,0.05)' : 'rgba(0,0,0,0.2)' }}>
                          <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} style={{ width: 18, height: 18, accentColor: '#4DA6FF' }} />
                          <span style={{ fontSize: 15 }}>Chuyển khoản ngân hàng</span>
                        </label>
                      </div>

                      {formData.paymentMethod === 'transfer' && (
                        <div style={{ marginTop: 16, padding: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px dashed rgba(255,255,255,0.2)' }}>
                          <QrCode size={24} color="#4DA6FF" />
                          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                            Quét mã QR dưới đây để thanh toán qua Momo/ZaloPay/App Ngân Hàng
                          </p>
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example_qr_code" alt="QR Code" style={{ width: 160, height: 160, borderRadius: 8, backgroundColor: '#fff', padding: 8 }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>IoTMatic</div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Viettinbank - 106880639530</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Summary Right Column */}
            <div style={{
              padding: 24, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 100
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
                Tóm tắt đơn hàng
              </h3>

              {isCheckout && (
                <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                      <div style={{ display: 'flex', gap: 12, color: 'rgba(255,255,255,0.8)' }}>
                        <span style={{ fontWeight: 600 }}>{item.quantity}x</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 150 }}>{item.name}</span>
                      </div>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                <span>Tổng số lượng:</span>
                <span>{totalItems} sản phẩm</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Tổng cộng:</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#4DA6FF' }}>{formatPrice(totalPrice)}</span>
              </div>

              {isCheckout ? (
                <button
                  type="submit" form="checkout-form"
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12,
                    backgroundColor: '#00A896', color: '#fff', fontSize: 16, fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'all 200ms',
                    boxShadow: '0 4px 15px rgba(0, 168, 150, 0.3)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 168, 150, 0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 168, 150, 0.3)' }}
                >
                  Xác nhận đặt hàng
                </button>
              ) : (
                <button style={{
                  width: '100%', padding: '16px', borderRadius: 12,
                  backgroundColor: '#00A896', color: '#fff', fontSize: 16, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 200ms',
                  boxShadow: '0 4px 15px rgba(0, 168, 150, 0.3)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 168, 150, 0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 168, 150, 0.3)' }}
                  onClick={() => setIsCheckout(true)}
                >
                  Tiến hành thanh toán
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>

      {/* Details Modal */}
      {detailsModal.show && detailsModal.order && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#0a1628',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18, padding: '28px 32px', width: 500, maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#fff',
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Chi tiết đơn hàng</h3>
              <button onClick={() => setDetailsModal({ show: false, order: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4DA6FF' }}>{detailsModal.order.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Trạng thái:</span>
                <span style={{ fontWeight: 600, color: detailsModal.order.status === 'pending' ? '#FCD34D' : '#6EE7B7' }}>
                  {detailsModal.order.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                </span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0', flexShrink: 0 }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Người nhận:</span>
                <span style={{ fontWeight: 600 }}>{detailsModal.order.shipping_name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>SĐT / Email:</span>
                <span>{detailsModal.order.shipping_phone} / {detailsModal.order.shipping_email}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Địa chỉ:</span>
                <span>{detailsModal.order.shipping_address}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Thanh toán:</span>
                <span>{detailsModal.order.payment_method === 'transfer' ? 'Chuyển khoản' : 'COD (Thanh toán khi nhận hàng)'}</span>
              </div>
              {detailsModal.order.note && (
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ghi chú:</span>
                  <span style={{ color: '#FCD34D', fontStyle: 'italic', background: 'rgba(245,158,11,0.1)', padding: '6px 10px', borderRadius: 6 }}>"{detailsModal.order.note}"</span>
                </div>
              )}
              
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0', flexShrink: 0 }}></div>
              
              <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Sản phẩm ({detailsModal.order.order_items?.length || 0}):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detailsModal.order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Số lượng: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#4DA6FF' }}>{formatPrice(item.product_price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.2)', flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Tổng thanh toán:</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#5AE87D' }}>{formatPrice(detailsModal.order.total_price)}</span>
              </div>
            </div>

            <button onClick={() => setDetailsModal({ show: false, order: null })} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: '#4DA6FF', color: '#0a1628', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              marginTop: 24, transition: 'filter 200ms', flexShrink: 0
            }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

