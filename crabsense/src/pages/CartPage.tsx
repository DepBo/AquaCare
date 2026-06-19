import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle, CreditCard, Truck, User, MapPin, Phone } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [isCheckout, setIsCheckout] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập quá trình đặt hàng thành công
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <button onClick={() => isCheckout ? setIsCheckout(false) : navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 200ms', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{isCheckout ? 'Quay lại giỏ hàng' : 'Quay lại cửa hàng'}</span>
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

                    <div style={{ position: 'relative', marginTop: 8 }}>
                      <label style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Phương thức thanh toán</label>
                      <select 
                        name="paymentMethod" 
                        value={formData.paymentMethod} onChange={handleInputChange}
                        style={{ 
                          width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 15, outline: 'none', appearance: 'none'
                        }}
                      >
                        <option value="cod" style={{ color: '#000' }}>Thanh toán khi nhận hàng (COD)</option>
                        <option value="transfer" style={{ color: '#000' }}>Chuyển khoản ngân hàng</option>
                        <option value="momo" style={{ color: '#000' }}>Ví điện tử MoMo</option>
                      </select>
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
      `}</style>
    </div>
  )
}

