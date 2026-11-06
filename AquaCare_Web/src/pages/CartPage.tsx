import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle, CreditCard, Truck, User, MapPin, Phone, Mail, FileText, QrCode } from 'lucide-react'
import { isComingSoonProduct, useCart } from '../contexts/CartContext'
import { createClient } from '@supabase/supabase-js'
import { API_URL } from '../config/api'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart, refreshCartPrices } = useCart()
  const navigate = useNavigate()

  const [isCheckout, setIsCheckout] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDemoSuccess, setIsDemoSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod'
  })

  const [userSession, setUserSession] = useState<any>(null)

  // Auto-fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserSession(session.user)
        const { data: userData } = await supabase.from('users').select('full_name, email, phone, address').eq('id', session.user.id).single()
        if (userData) {
          setFormData(prev => ({
            ...prev,
            fullName: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || prev.phone,
            address: userData.address || prev.address
          }))
        }
      }
    }
    fetchUser()
  }, [])

  const noteWordsCount = formData.note.trim() === '' ? 0 : formData.note.trim().split(/\s+/).length;
  const isDemoCart = cart.length > 0 && cart.every(item => item.id === 'v3-demo')

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
    if (isSubmitting) return
    if (cart.some(item => isComingSoonProduct(item.id))) {
      alert('V1, V2 và V4 hiện chưa mở bán. Vui lòng xóa sản phẩm này khỏi giỏ hàng.')
      return
    }
    setIsSubmitting(true)

    try {
      if (await refreshCartPrices()) {
        alert('Giá sản phẩm vừa được cập nhật. Vui lòng kiểm tra lại giỏ hàng trước khi đặt đơn.')
        setIsSubmitting(false)
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (cart.some(item => item.id === 'v3-demo') && cart.some(item => item.id !== 'v3-demo')) {
        alert('Vui lòng đặt V3 Demo thành đơn riêng để hệ thống cấp mã tự động.')
        setIsSubmitting(false)
        return
      }
      const demoOnly = cart.length > 0 && cart.every(item => item.id === 'v3-demo')
      if (demoOnly) {
        if (!session?.access_token) {
          alert('Vui lòng đăng nhập để nhận mã V3 Demo trong tài khoản của bạn.')
          setIsSubmitting(false)
          return
        }
        const keyName = 'aquacare_demo_checkout_key'
        const quantity = cart.reduce((sum, item) => sum + item.quantity, 0)
        let savedRequest: { key: string, quantity: number } | null = null
        try { savedRequest = JSON.parse(sessionStorage.getItem(keyName) || 'null') } catch { /* Use a new key. */ }
        const requestKey = savedRequest?.quantity === quantity ? savedRequest.key : crypto.randomUUID()
        sessionStorage.setItem(keyName, JSON.stringify({ key: requestKey, quantity }))
        const response = await fetch(`${API_URL}/api/orders/demo/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            requestKey, quantity,
            fullName: formData.fullName, note: formData.note,
          }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Không thể hoàn tất đơn demo.')
        sessionStorage.removeItem(keyName)
        setIsDemoSuccess(true)
        setIsSuccess(true)
        clearCart()
        return
      }

      const orderItems: any[] = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        device_macs: [] // Sẽ được nhân viên kho cập nhật sau
      }));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session?.user?.id || null,
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
        setIsSubmitting(false)
        return
      }

      const finalOrderItems = orderItems.map(oi => ({ ...oi, order_id: order.id }));
      const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems)

      if (itemsError) {
        const { error: rollbackError } = await supabase.from('orders').delete().eq('id', order.id)
        alert('Lỗi lưu chi tiết đơn hàng: ' + itemsError.message + (rollbackError ? '. Không thể hủy đơn vừa tạo; vui lòng liên hệ hỗ trợ.' : ''))
        setIsSubmitting(false)
        return
      }

      // Sync address to users profile if user is logged in
      if (session?.user?.id && formData.address.trim()) {
        try {
          await supabase.from('users').update({ address: formData.address.trim() }).eq('id', session.user.id)
          const userStr = localStorage.getItem('user_info')
          if (userStr) {
            const u = JSON.parse(userStr)
            localStorage.setItem('user_info', JSON.stringify({ ...u, address: formData.address.trim() }))
          }
        } catch (syncErr) {
          console.warn('Sync address to user notice:', syncErr)
        }
      }

      setIsSuccess(true)
      clearCart()
    } catch (err: any) {
      alert('Đã xảy ra lỗi không xác định: ' + (err?.message || 'Vui lòng thử lại.'))
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#fff', fontFamily: "'Inter', sans-serif", paddingTop: 120, paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <CheckCircle size={80} color="#5AE87D" style={{ margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Đặt hàng thành công!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.6 }}>
            {isDemoSuccess
              ? 'Đơn V3 Demo đã được xử lý tự động. Mã MAC simulator sẽ được gửi đến email tài khoản của bạn. Không có thiết bị vật lý được giao.'
              : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                display: 'inline-block', padding: '15px 32px', borderRadius: 12,
                backgroundColor: '#00A896', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
                transition: 'transform 200ms', width: '100%',
                boxShadow: '0 4px 14px rgba(0, 168, 150, 0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Xem lịch sử đơn hàng
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-block', padding: '13px 32px', borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 15,
                border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                transition: 'transform 200ms', width: '100%'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#fff', fontFamily: "'Inter', sans-serif", paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button onClick={() => isCheckout ? setIsCheckout(false) : navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 200ms', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{isCheckout ? 'Quay lại giỏ hàng' : 'Quay lại cửa hàng'}</span>
          </button>
          
          <button onClick={() => navigate('/orders')} style={{ background: 'linear-gradient(135deg, rgba(0,168,150,0.2), rgba(77,166,255,0.2))', border: '1px solid rgba(77,166,255,0.35)', color: '#fff', padding: '10px 18px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, transition: 'all 200ms', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,168,150,0.35), rgba(77,166,255,0.35))'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,168,150,0.2), rgba(77,166,255,0.2))'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <FileText size={16} color="#4DA6FF" /> Xem lịch sử đơn hàng
          </button>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          {isCheckout ? <CreditCard size={32} color="#FF8C42" /> : <ShoppingBag size={32} color="#FF8C42" />}
          {isCheckout ? 'Thanh toán' : 'Giỏ hàng của bạn'}
        </h1>

        {cart.length === 0 && !isCheckout ? (
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
                    {isDemoCart ? 'Thông tin nhận mã V3 Demo' : 'Thông tin giao hàng'}
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

                    {!isDemoCart && <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Số điện thoại</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="tel" name="phone" required pattern="(?:0|\+84)[0-9]{9}" title="Nhập số điện thoại 10 số bắt đầu bằng 0 hoặc +84"
                          value={formData.phone} onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none'
                          }}
                        />
                      </div>
                    </div>}

                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="email" name="email" required
                          value={isDemoCart ? (userSession?.email || formData.email) : formData.email}
                          onChange={handleInputChange} readOnly={isDemoCart && !!userSession}
                          placeholder="Nhập địa chỉ email"
                          style={{
                            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {!isDemoCart && <div style={{ position: 'relative' }}>
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
                    </div>}

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

                    {isDemoCart ? (
                      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,168,150,0.12)', color: '#a7f3d0', fontSize: 14 }}>
                        Đơn V3 Demo miễn phí. Không cần thanh toán hoặc nhận thiết bị vật lý; mã MAC sẽ được gửi tới email tài khoản.
                      </div>
                    ) : <div style={{ position: 'relative', marginTop: 8 }}>
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
                    </div>}
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
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12,
                    backgroundColor: isSubmitting ? 'rgba(0, 168, 150, 0.6)' : '#00A896', color: '#fff', fontSize: 16, fontWeight: 700,
                    border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 200ms',
                    boxShadow: '0 4px 15px rgba(0, 168, 150, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 168, 150, 0.4)' } }}
                  onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 168, 150, 0.3)' } }}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Đang xử lý đơn hàng...
                    </>
                  ) : (
                    'Xác nhận đặt hàng'
                  )}
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
      </div>
  )
}

