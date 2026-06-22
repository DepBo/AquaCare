import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Star, Info, X } from 'lucide-react'
import { useCart, type Product } from '../contexts/CartContext'

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Cảm biến pH & Nhiệt độ IoT',
    description: 'Giám sát 24/7 chất lượng nước, cảnh báo qua ứng dụng khi thông số vượt ngưỡng.',
    price: 1250000,
    image: '/images/fish1.png',
    rating: 4.8,
    details: ['Cảm biến quang học siêu nhạy', 'Kết nối WiFi & Bluetooth 5.0', 'Pin dự phòng lên đến 48h', 'Vỏ ngoài chống nước IP68', 'App theo dõi tiếng Việt trực quan']
  },
  {
    id: 'p2',
    name: 'Máy cho cá ăn tự động AquaFeeder',
    description: 'Lên lịch cho ăn thông minh qua điện thoại, dung tích 5L, chống ẩm mốc thức ăn.',
    price: 850000,
    image: '/images/fish2.png',
    rating: 4.5,
    details: ['Khay chứa siêu lớn 5 lít', 'Ghi âm giọng nói gọi cá', 'Quạt hút ẩm giữ thức ăn luôn giòn', 'Nguồn điện 5V/1A tiết kiệm năng lượng', 'Cảm biến báo sắp hết thức ăn']
  },
  {
    id: 'p3',
    name: 'Máy bơm nước thông minh 12V',
    description: 'Điều khiển từ xa, tự động kích hoạt khi DO (oxy hòa tan) trong nước thấp.',
    price: 1500000,
    image: '/images/fish3.png',
    rating: 4.9,
    details: ['Động cơ không chổi than siêu êm', 'Tự động ngắt khi cạn nước', 'Lưu lượng tối đa 3000L/H', 'Điện áp an toàn 12V DC', 'Chế độ tạo sóng sinh thái']
  },
  {
    id: 'p4',
    name: 'Bộ đo độ mặn kỹ thuật số',
    description: 'Thiết kế cầm tay tiện dụng, chống nước IP67, độ chính xác cao.',
    price: 450000,
    image: '/images/fish4.png',
    rating: 4.6,
    details: ['Màn hình LCD đèn nền rõ nét', 'Phạm vi đo 0 - 100 ppt', 'Tự động bù nhiệt độ (ATC)', 'Đầu dò Titan chống ăn mòn', 'Tự động tắt sau 5 phút']
  },
  {
    id: 'p5',
    name: 'Đèn LED quang phổ rộng',
    description: 'Mô phỏng ánh sáng tự nhiên, kích thích màu sắc cá và sự phát triển của cây thủy sinh.',
    price: 650000,
    image: '/@fs/C:/Users/dang9/.gemini/antigravity-ide/brain/4c61e183-6166-4ca6-a4ca-47367d0181ce/realistic_aquarium_led_1781832764309.png',
    rating: 4.7,
    details: ['Quang phổ toàn dải 10000K', 'Chế độ ban ngày và ban đêm (Moonlight)', 'Vỏ nhôm tản nhiệt hợp kim nhôm', 'Chống chập điện chuẩn IP67', 'Điều chỉnh độ sáng 0-100% qua App']
  },
  {
    id: 'p6',
    name: 'Hệ thống lọc sủi vi sinh',
    description: 'Tăng cường oxy hòa tan, thiết kế nhỏ gọn, dễ dàng vệ sinh bảo dưỡng.',
    price: 320000,
    image: '/images/crab2.png',
    rating: 4.4,
    details: ['Lõi lọc vi sinh cao cấp', 'Thiết kế giấu ống dây', 'Chân hít chân không chắc chắn', 'Không gây tiếng ồn (<25dB)', 'Phù hợp bể nuôi tôm, cá nhỏ']
  },
  {
    id: 'p7',
    name: 'Camera giám sát dưới nước',
    description: 'Quan sát rõ nét 1080p, kết nối wifi theo dõi cá từ xa 24/7.',
    price: 1850000,
    image: '/images/crab3.png',
    rating: 4.8,
    details: ['Độ phân giải Full HD 1080p', 'Góc quay siêu rộng 120 độ', 'Hồng ngoại quay đêm rõ nét', 'Vỏ bọc Nano chống rêu bám', 'Lưu trữ đám mây hoặc thẻ nhớ MicroSD']
  },
  {
    id: 'p8',
    name: 'Bộ làm lạnh nước Chiller',
    description: 'Duy trì nhiệt độ ổn định cho các dòng cá xứ lạnh, tiết kiệm điện năng.',
    price: 2450000,
    image: '/@fs/C:/Users/dang9/.gemini/antigravity-ide/brain/4c61e183-6166-4ca6-a4ca-47367d0181ce/realistic_aquarium_chiller_1781832776627.png',
    rating: 4.9,
    details: ['Máy nén Panasonic siêu bền', 'Môi chất lạnh R134a an toàn', 'Kiểm soát nhiệt độ chính xác ±0.1°C', 'Thiết kế vỏ kim loại sơn tĩnh điện', 'Vận hành êm ái, độ ồn thấp']
  }
];

const F = "'Inter', sans-serif"

export default function ProductsSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<{[key: string]: boolean}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedItems({ ...addedItems, [product.id]: true });
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <section
      id="products"
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
            <div style={{ width: 28, height: 1, backgroundColor: '#FF8C42' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#FF8C42' }}>Thiết bị</span>
            <div style={{ width: 28, height: 1, backgroundColor: '#FF8C42' }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Thiết bị theo dõi <span className="gradient-text">chăm sóc bể cá</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Nâng cấp hệ thống giám sát của bạn với các thiết bị thông minh, dễ dàng kết nối và quản lý.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }} className="products-grid">
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 20,
                overflow: 'hidden',
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 600ms ease ${200 + i * 100}ms`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ height: 200, width: '100%', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.4 }}>{product.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{product.rating}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, flex: 1, margin: '0 0 20px 0' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#4DA6FF' }}>
                    {formatPrice(product.price)}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 200ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                      <Info size={16} />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        background: addedItems[product.id] ? '#5AE87D' : 'rgba(77, 166, 255, 0.1)',
                        color: addedItems[product.id] ? '#000' : '#4DA6FF',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 200ms',
                      }}
                      onMouseEnter={e => {
                        if (!addedItems[product.id]) {
                          e.currentTarget.style.background = 'rgba(77, 166, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!addedItems[product.id]) {
                          e.currentTarget.style.background = 'rgba(77, 166, 255, 0.1)';
                        }
                      }}
                    >
                      <ShoppingCart size={16} />
                      {addedItems[product.id] ? 'Đã thêm' : 'Thêm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Details */}
      {selectedProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#0f2038',
            borderRadius: 24,
            maxWidth: 600, width: '100%',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer', transition: 'all 200ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            >
              <X size={20} />
            </button>
            <div style={{ height: 260, width: '100%', position: 'relative', flexShrink: 0 }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: 32, overflowY: 'auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{selectedProduct.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{selectedProduct.rating}</span>
                <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.2)' }}>|</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#4DA6FF' }}>{formatPrice(selectedProduct.price)}</span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
                {selectedProduct.description}
              </p>
              
              {selectedProduct.details && (
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Đặc điểm nổi bật:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedProduct.details.map((detail, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4DA6FF', marginTop: 8, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{
                    flex: 1, padding: '14px 24px', borderRadius: 12,
                    background: '#FF8C42', color: '#fff', fontSize: 16, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 200ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ff9d5c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FF8C42'}
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
