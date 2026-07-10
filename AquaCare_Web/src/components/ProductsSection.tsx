import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Star, Info, X } from 'lucide-react'
import { useCart, type Product } from '../contexts/CartContext'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

export default function ProductsSection() {
  const ref = useRef<HTMLElement>(null)
  const [vis, setVis] = useState(false)
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<{[key: string]: boolean}>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('version', { ascending: true })

      if (!error && data && data.length > 0) {
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image_url,
          rating: 4.9,
          details: p.details || []
        }))
        setProducts(formatted)
      } else {
        console.error("Failed to load products", error)
      }
      setLoading(false);
    }
    fetchProducts()
  }, [])

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
      <style>{`
        .product-action-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        @media (max-width: 640px) {
          .product-action-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .product-action-bar > span {
            text-align: center;
          }
          .product-action-bar > div {
            justify-content: center;
          }
        }
      `}</style>
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#4DA6FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }} className="products-grid">
            {products.map((product, i) => (
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
                <div className="product-action-bar">
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
                        whiteSpace: 'nowrap',
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
                        whiteSpace: 'nowrap',
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
        )}
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
