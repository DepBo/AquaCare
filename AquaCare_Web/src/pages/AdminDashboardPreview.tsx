import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ArrowRight, Box, CheckCircle2, Clock3, CreditCard, LayoutDashboard,
  RefreshCw, ShoppingBag, TrendingUp, Users,
} from 'lucide-react'
import './AdminDashboardPreview.css'

type AdminSection = 'orders' | 'devices' | 'staff' | 'subscriptions'
type RevenuePoint = { date: string; amount: number }
type DashboardData = {
  generatedAt: string
  revenue: {
    currentMonth: number; previousMonth: number; changePercent: number | null
    deliveredMonth: number; averageOrder: number; last7Days: number
    series7: RevenuePoint[]; series30: RevenuePoint[]
  }
  orders: { pending: number; packing: number; shipping: number; deliveredMonth: number }
  devices: { assigned: number }
  staff: { total: number }
  recentOrders: { id: number; status: string; createdAt: string }[]
}

const API_URL = (
  import.meta.env.DEV
    ? 'http://localhost:5000'
    : import.meta.env.VITE_API_URL || 'https://aquacare-p78r.onrender.com'
).replace(/\/+$/, '')
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`
const dateLabel = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
}).format(new Date(`${value}T00:00:00+07:00`))
const timeLabel = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
}).format(new Date(value))
const statusLabel: Record<string, string> = {
  pending: 'Chờ duyệt', confirmed: 'Đã duyệt', approved: 'Đã duyệt',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
}

export default function AdminDashboardPreview({ onNavigate, supabase }: {
  onNavigate: (section: AdminSection) => void
  supabase: SupabaseClient
}) {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token || localStorage.getItem('access_token')
      if (!token) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Không thể xác thực quyền admin. Vui lòng đăng nhập lại.')
        }
        throw new Error(`Không tải được dữ liệu tổng quan (HTTP ${response.status}). Vui lòng thử lại.`)
      }
      setData(await response.json() as DashboardData)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu tổng quan.')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { void loadDashboard() }, [loadDashboard])

  if (!data) {
    return <div className="admin-preview__state" role="status">
      <strong>{loading ? 'Đang tải tổng quan...' : 'Chưa thể hiển thị tổng quan'}</strong>
      {error && <p>{error}</p>}
      {!loading && <button onClick={() => void loadDashboard()}><RefreshCw size={15} /> Thử lại</button>}
    </div>
  }

  const revenue = data.revenue
  const sales = range === '7d' ? revenue.series7 : revenue.series30
  const chartMax = Math.max(1, ...sales.map(point => point.amount))
  const compareMax = Math.max(1, revenue.currentMonth, revenue.previousMonth)
  const change = revenue.changePercent

  return (
    <div className="admin-preview">
      <div className="admin-preview__intro">
        <div>
          <span className="admin-preview__eyebrow">TRUNG TÂM QUẢN TRỊ</span>
          <h2>Một góc nhìn cho toàn bộ AquaCare</h2>
          <p>Theo dõi kinh doanh, đơn hàng và hoạt động vận hành.</p>
        </div>
        <button className="admin-preview__refresh" onClick={() => void loadDashboard()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          {loading ? 'Đang cập nhật' : `Cập nhật ${timeLabel(data.generatedAt)}`}
        </button>
      </div>
      {error && <div className="admin-preview__error" role="alert">{error} <button onClick={() => void loadDashboard()}>Thử lại</button></div>}

      <div className="admin-preview__top-grid">
        <section className="admin-preview__revenue">
          <div className="admin-preview__revenue-heading">
            <span className="admin-preview__revenue-icon"><CreditCard size={21} /></span>
            <span>DOANH THU</span>
          </div>
          <strong>{money(revenue.currentMonth)}</strong>
          <div className="admin-preview__revenue-meta">
            <span>Giá trị đơn đã giao trong tháng</span>
            <span className={`admin-preview__growth ${change !== null && change < 0 ? 'negative' : ''}`}>
              <TrendingUp size={15} />
              {change === null ? 'Chưa có số liệu tháng trước' : `${change > 0 ? '+' : ''}${change.toLocaleString('vi-VN')}% so với tháng trước`}
            </span>
          </div>
          <div className="admin-preview__revenue-detail">
            <div className="admin-preview__revenue-stat"><small>Đơn đã giao</small><b>{revenue.deliveredMonth}</b></div>
            <div className="admin-preview__revenue-stat"><small>Trung bình / đơn</small><b>{money(revenue.averageOrder)}</b></div>
            <div className="admin-preview__compare">
              <div><span>Tháng trước</span><i><em style={{ width: `${revenue.previousMonth / compareMax * 100}%` }} /></i></div>
              <div><span>Tháng này</span><i><em style={{ width: `${revenue.currentMonth / compareMax * 100}%` }} /></i></div>
            </div>
          </div>
          <span className="admin-preview__revenue-note">Theo ngày tạo đơn · chưa đối soát thanh toán</span>
          <div className="admin-preview__revenue-glow" />
        </section>
        <div className="admin-preview__metric-grid">
          <button className="admin-preview__metric" onClick={() => onNavigate('orders')}>
            <span className="admin-preview__metric-icon amber"><Clock3 size={20} /></span>
            <span className="admin-preview__metric-label">Đơn chờ duyệt</span>
            <strong>{data.orders.pending}</strong><small>Cần kiểm tra</small>
          </button>
          <button className="admin-preview__metric" onClick={() => onNavigate('orders')}>
            <span className="admin-preview__metric-icon green"><CheckCircle2 size={20} /></span>
            <span className="admin-preview__metric-label">Đơn đã giao</span>
            <strong>{data.orders.deliveredMonth}</strong><small>Trong tháng này</small>
          </button>
          <button className="admin-preview__metric" onClick={() => onNavigate('devices')}>
            <span className="admin-preview__metric-icon blue"><Box size={20} /></span>
            <span className="admin-preview__metric-label">Thiết bị đã cấp</span>
            <strong>{data.devices.assigned}</strong><small>Đang gắn với bể</small>
          </button>
          <button className="admin-preview__metric" onClick={() => onNavigate('staff')}>
            <span className="admin-preview__metric-icon violet"><Users size={20} /></span>
            <span className="admin-preview__metric-label">Nhân viên</span>
            <strong>{data.staff.total}</strong><small>Trong hệ thống</small>
          </button>
        </div>
      </div>

      <div className="admin-preview__middle-grid">
        <section className="admin-preview__panel">
          <div className="admin-preview__panel-heading">
            <div><h3>Xu hướng doanh thu</h3><p>Giá trị đơn đã giao theo ngày tạo đơn</p></div>
            <div className="admin-preview__range" aria-label="Khoảng thời gian biểu đồ">
              <button className={range === '7d' ? 'active' : ''} onClick={() => setRange('7d')}>7 ngày</button>
              <button className={range === '30d' ? 'active' : ''} onClick={() => setRange('30d')}>30 ngày</button>
            </div>
          </div>
          <div className="admin-preview__chart" role="img" aria-label="Biểu đồ giá trị đơn đã giao">
            {sales.map((point, index) => (
              <div className="admin-preview__chart-column" key={point.date} title={`${dateLabel(point.date)}: ${money(point.amount)}`}>
                <span style={{ height: `${point.amount / chartMax * 88}%` }} />
                <small>{range === '7d' || index % 5 === 0 || index === sales.length - 1 ? dateLabel(point.date) : ''}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-preview__panel">
          <div className="admin-preview__panel-heading"><div><h3>Tiến độ đơn hàng</h3><p>Tổng quan quy trình xử lý</p></div></div>
          <div className="admin-preview__orders">
            {[
              ['Chờ duyệt', data.orders.pending, 'amber'],
              ['Đang đóng gói', data.orders.packing, 'blue'],
              ['Đang giao', data.orders.shipping, 'violet'],
              ['Đã giao trong tháng', data.orders.deliveredMonth, 'green'],
            ].map(([label, count, tone]) => (
              <div className="admin-preview__order-row" key={label}>
                <div><span className={`admin-preview__dot ${tone}`} />{label}</div><strong>{count}</strong>
              </div>
            ))}
          </div>
          <button className="admin-preview__text-link" onClick={() => onNavigate('orders')}>Xem đơn hàng <ArrowRight size={15} /></button>
        </section>
      </div>

      <div className="admin-preview__bottom-grid">
        <section className="admin-preview__panel">
          <div className="admin-preview__panel-heading"><div><h3>Đơn hàng gần đây</h3><p>Cập nhật từ hệ thống</p></div></div>
          <div className="admin-preview__activity">
            {data.recentOrders.length === 0 && <p className="admin-preview__empty">Chưa có đơn hàng.</p>}
            {data.recentOrders.map(order => <button key={order.id} onClick={() => onNavigate('orders')}>
              <span className="admin-preview__metric-icon blue"><ShoppingBag size={18} /></span>
              <span className="admin-preview__activity-copy"><strong>Đơn #{order.id}</strong><small>{statusLabel[order.status] || order.status}</small></span>
              <time>{timeLabel(order.createdAt)}</time><ArrowRight size={15} />
            </button>)}
          </div>
        </section>
        <section className="admin-preview__panel admin-preview__shortcuts">
          <div className="admin-preview__panel-heading"><div><h3>Truy cập nhanh</h3><p>Đến đúng nơi bạn cần</p></div></div>
          <button onClick={() => onNavigate('orders')}><ShoppingBag size={18} /> Quản lý đơn hàng <ArrowRight size={16} /></button>
          <button onClick={() => onNavigate('devices')}><Box size={18} /> Thiết bị & kho <ArrowRight size={16} /></button>
          <button onClick={() => onNavigate('staff')}><Users size={18} /> Nhân viên <ArrowRight size={16} /></button>
          <button onClick={() => onNavigate('subscriptions')}><LayoutDashboard size={18} /> Gói cước <ArrowRight size={16} /></button>
        </section>
      </div>
    </div>
  )
}
