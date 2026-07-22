import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Fish, Box, LogOut, ArrowLeft, Sun, Moon,
  Plus, Edit, Trash2, X, Server, Users, Shield, ShoppingCart,
  CheckCheck, FileText, Truck, Wrench, CheckCircle, ArrowRight, Eye, EyeOff
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

// ─── Theme Setup ─────────────────────────────────────────────────────────────
const ThemeStyles = ({ theme }: { theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark'
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      :root[data-theme="${theme}"] {
        --ap-bg-main: ${isDark ? '#0f172a' : '#f8fafc'};
        --ap-bg-sidebar: ${isDark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)'};
        --ap-bg-topbar: ${isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)'};
        --ap-bg-card: ${isDark ? '#1e293b' : '#ffffff'};
        --ap-bg-modal: ${isDark ? '#1e293b' : '#ffffff'};
        
        --ap-text-primary: ${isDark ? '#f8fafc' : '#0f172a'};
        --ap-text-secondary: ${isDark ? '#94a3b8' : '#475569'};
        --ap-text-muted: ${isDark ? '#64748b' : '#94a3b8'};
        
        --ap-border: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
        
        --ap-hover-bg: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
        --ap-hover-danger: ${isDark ? 'rgba(255,107,107,0.15)' : 'rgba(255,107,107,0.1)'};
        
        --ap-input-bg: ${isDark ? 'rgba(0,0,0,0.2)' : '#ffffff'};
        --ap-input-border: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
        
        --ap-shadow: ${isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)'};
        --ap-shadow-sm: ${isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.05)'};
        
        --ap-table-header: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
        
        --ap-purple-text: ${isDark ? '#a78bfa' : '#7c3aed'};
        --ap-purple-bg: ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.1)'};
        
        --ap-modal-overlay: ${isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.3)'};
        --ap-btn-cancel: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
      }
    `}} />
  )
}

interface FishSpecies {
  id: number
  species_name: string
  temp_min: number
  temp_max: number
  ph_min: number
  ph_max: number
  tds_min: number
  tds_max: number
}

interface Device {
  id: number
  mac_address: string
  firmware_version: string
  is_active: boolean
  created_at: string
  tank_id?: number
  tanks?: {
    tank_name: string
    users?: {
      full_name: string
      phone: string
    }
  }
}

interface Staff {
  id: string
  full_name: string
  email: string
  phone: string
  created_at: string
}



const getNormalizedVersion = (version: string) => {
  if (!version) return 'V1'
  const v = version.toUpperCase()
  if (v.includes('V1')) return 'V1'
  if (v.includes('V2')) return 'V2'
  if (v.includes('V3')) return 'V3'
  return 'V1'
}

// ─── Orders ──────────────────────────────────────────────────────────────────
interface Order {
  id: string
  customerName: string
  phone: string
  email: string
  address: string
  note: string
  productVersion: string
  totalQuantity: number
  totalPrice: number
  paymentMethod: 'COD' | 'Chuyển khoản'
  status: 'pending' | 'approved'
  createdAt: string
}

const TASK_TYPES = [
  { value: 'delivery', label: 'Giao hàng', icon: Truck },
  { value: 'installation', label: 'Lắp đặt mới', icon: Wrench },
]

function Dialog({
  title, message, error, confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmColor = 'var(--ap-purple-text)', onConfirm, onCancel, children
}: any) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--ap-modal-overlay)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--ap-bg-modal)',
        border: '1px solid var(--ap-border)',
        borderRadius: 18, padding: '28px 32px', width: 420, maxWidth: '90vw',
        boxShadow: 'var(--ap-shadow)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--ap-text-primary)' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ap-text-primary)' }}>
            <X size={16} />
          </button>
        </div>
        {message && <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--ap-text-primary)' }}>{message}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
        {error && <p style={{ margin: '16px 0 0', fontSize: 13, color: '#FF6B6B', fontWeight: 500, textAlign: 'center' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {cancelText && (
            <button onClick={onCancel} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--ap-border)',
              background: 'var(--ap-btn-cancel)', color: 'var(--ap-text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: F, fontWeight: 600,
              transition: 'background 160ms'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--ap-btn-cancel)'}
            >{cancelText}</button>
          )}
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            transition: 'filter 160ms'
          }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', ...props }: any) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input style={{
          width: '100%', padding: '10px 12px', paddingRight: isPassword ? 40 : 12, borderRadius: 10, border: '1px solid var(--ap-input-border)',
          background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: F, outline: 'none',
          transition: 'border-color 160ms'
        }}
          type={actualType}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-purple-text)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--ap-input-border)'}
          {...props} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ap-text-secondary)'
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const userInfoStr = localStorage.getItem('user_info')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'species' | 'devices' | 'staff' | 'orders'>('species')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [approveModal, setApproveModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [receiptModal, setReceiptModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [detailsModal, setDetailsModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [selectedTaskType, setSelectedTaskType] = useState('delivery')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark')

  const [species, setSpecies] = useState<FishSpecies[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [devicePage, setDevicePage] = useState(0)
  const [devicePageInput, setDevicePageInput] = useState('1')
  const [deviceFilterVersion, setDeviceFilterVersion] = useState('all')
  const [deviceFilterStatus, setDeviceFilterStatus] = useState('all')

  const [products, setProducts] = useState<{version: number, price: number}[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [speciesModal, setSpeciesModal] = useState<{ show: boolean, data?: FishSpecies, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [spForm, setSpForm] = useState<Partial<FishSpecies>>({})

  const [deviceModal, setDeviceModal] = useState<{ show: boolean, data?: Device, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [devForm, setDevForm] = useState<{ mac_address: string, firmware_version: string }>({ mac_address: '', firmware_version: 'V1' })

  const [staffModal, setStaffModal] = useState<{ show: boolean, data?: Staff, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [staffForm, setStaffForm] = useState({ full_name: '', email: '', phone: '', password: '' })

  const [errorMsg, setErrorMsg] = useState('')

  const [notification, setNotification] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' })

  const showNotification = (msg: string) => {
    setNotification({ show: true, msg })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dashboard_theme', theme)
  }, [theme])

  const fetchData = async () => {
    setLoading(true)
    const { data: spData } = await supabase.from('fish_species').select('*').order('id')
    if (spData) setSpecies(spData)

    const { data: devData } = await supabase.from('devices').select('*, tanks(tank_name, users(full_name, phone))').order('created_at', { ascending: false })
    if (devData) setDevices(devData)

    const { data: staffData } = await supabase.from('users').select('*').eq('role', 'staff').order('created_at', { ascending: false })
    if (staffData) setStaff(staffData)

    const { data: ordersData } = await supabase.from('orders').select('*, order_items(product_name, quantity, device_mac)').order('created_at', { ascending: false })
    if (ordersData) {
      const mappedOrders = ordersData.map((o: any) => ({
        id: o.id,
        customerName: o.shipping_name,
        phone: o.shipping_phone,
        email: o.shipping_email || 'N/A',
        address: o.shipping_address,
        note: o.note || '',
        productVersion: o.order_items && o.order_items.length > 0 ? o.order_items.map((i: any) => i.product_name).join(', ') : 'N/A',
        deviceMacs: o.order_items && o.order_items.length > 0 ? o.order_items.map((i: any) => i.device_mac).filter(Boolean).join(', ') : '',
        totalQuantity: o.order_items && o.order_items.length > 0 ? o.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 1,
        totalPrice: o.total_price,
        paymentMethod: (o.payment_method === 'transfer' ? 'Chuyển khoản' : 'COD') as 'Chuyển khoản' | 'COD',
        status: o.status,
        createdAt: o.created_at
      }))
      setOrders(mappedOrders)
    }

    const { data: prodData } = await supabase.from('products').select('version, price')
    if (prodData) setProducts(prodData)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('cs_auth')
    localStorage.removeItem('cs_role')
    localStorage.removeItem('user_info')
    localStorage.removeItem('access_token')
    navigate('/')
  }

  // ---- Species CRUD ----
  const saveSpecies = async () => {
    setErrorMsg('')
    if (!spForm.species_name) return setErrorMsg('Vui lòng nhập tên loài cá')
    if (speciesModal.mode === 'add') {
      const { error } = await supabase.from('fish_species').insert(spForm)
      if (error) return setErrorMsg('Lỗi: ' + error.message)
      showNotification('Thêm loài cá thành công!')
    } else if (speciesModal.mode === 'edit' && speciesModal.data) {
      const { error } = await supabase.from('fish_species').update(spForm).eq('id', speciesModal.data.id)
      if (error) return setErrorMsg('Lỗi: ' + error.message)
      showNotification('Cập nhật loài cá thành công!')
    } else if (speciesModal.mode === 'delete' && speciesModal.data) {
      const { error } = await supabase.from('fish_species').delete().eq('id', speciesModal.data.id)
      if (error) return setErrorMsg('Lỗi: ' + error.message)
      showNotification('Xóa loài cá thành công!')
    }
    setSpeciesModal({ show: false, mode: 'add' })
    fetchData()
  }

  const openSpeciesModal = (mode: 'add' | 'edit' | 'delete', data?: FishSpecies) => {
    setSpeciesModal({ show: true, mode, data })
    if (mode === 'add') setSpForm({ species_name: '', temp_min: 24, temp_max: 30, ph_min: 6.5, ph_max: 7.5, tds_min: 100, tds_max: 300 })
    else if (data) setSpForm(data)
  }

  // ---- Devices CRUD ----
  const saveDevice = async () => {
    setErrorMsg('')
    if (deviceModal.mode === 'add') {
      if (!devForm.mac_address) return setErrorMsg('Vui lòng nhập MAC Address')
      const { error } = await supabase.from('devices').insert({
        mac_address: devForm.mac_address.trim(),
        firmware_version: devForm.firmware_version,
      })
      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          return setErrorMsg('MAC Address này đã tồn tại trong hệ thống!')
        }
        return setErrorMsg('Lỗi: ' + error.message)
      }
      showNotification('Thêm thiết bị thành công!')
    } else if (deviceModal.mode === 'edit' && deviceModal.data) {
      const { error } = await supabase.from('devices').update({
        mac_address: devForm.mac_address.trim(),
        firmware_version: devForm.firmware_version,
      }).eq('id', deviceModal.data.id)
      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          return setErrorMsg('MAC Address này đã tồn tại trong hệ thống!')
        }
        return setErrorMsg('Lỗi: ' + error.message)
      }
      showNotification('Cập nhật thiết bị thành công!')
    } else if (deviceModal.mode === 'delete' && deviceModal.data) {
      const { error } = await supabase.from('devices').delete().eq('id', deviceModal.data.id)
      if (error) return setErrorMsg('Lỗi: ' + error.message)
      showNotification('Xóa thiết bị thành công!')
    }
    setDeviceModal({ show: false, mode: 'add' })
    fetchData()
  }

  const openDeviceModal = (mode: 'add' | 'edit' | 'delete', data?: Device) => {
    setDeviceModal({ show: true, mode, data })
    if (mode === 'add') setDevForm({ mac_address: '', firmware_version: 'V1' })
    else if (data) setDevForm({ mac_address: data.mac_address, firmware_version: getNormalizedVersion(data.firmware_version) })
  }

  // ---- Staff CRUD ----
  const saveStaff = async () => {
    setErrorMsg('')
    if (staffModal.mode === 'add') {
      if (!staffForm.email || !staffForm.password || !staffForm.full_name) return setErrorMsg('Vui lòng điền đủ thông tin bắt buộc')

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staffForm.email,
        password: staffForm.password,
      })

      if (authError) return setErrorMsg('Lỗi tạo tài khoản: ' + authError.message)

      if (authData.user) {
        // The DB trigger automatically creates a row in users on sign up.
        // We just need to update that row with staff details and role.
        const { error: dbError } = await supabase.from('users').update({
          full_name: staffForm.full_name,
          phone: staffForm.phone || null,
          role: 'staff'
        }).eq('id', authData.user.id)
        if (dbError) return setErrorMsg('Lỗi lưu thông tin: ' + dbError.message)
        showNotification('Thêm nhân viên thành công!')
      }
    } else if (staffModal.mode === 'edit' && staffModal.data) {
      if (!staffForm.full_name) return setErrorMsg('Vui lòng điền họ tên')
      const { error: dbError } = await supabase.from('users').update({
        full_name: staffForm.full_name,
        phone: staffForm.phone || null,
      }).eq('id', staffModal.data.id)
      if (dbError) return setErrorMsg('Lỗi cập nhật: ' + dbError.message)
      showNotification('Cập nhật nhân viên thành công!')
    } else if (staffModal.mode === 'delete' && staffModal.data) {
      const { error } = await supabase.from('users').delete().eq('id', staffModal.data.id)
      if (error) return setErrorMsg('Lỗi xóa nhân viên: ' + error.message)
      showNotification('Xóa nhân viên thành công!')
    }
    setStaffModal({ show: false, mode: 'add' })
    fetchData()
  }

  const openStaffModal = (mode: 'add' | 'edit' | 'delete', data?: Staff) => {
    setStaffModal({ show: true, mode, data })
    if (mode === 'add') {
      setStaffForm({ full_name: '', email: '', phone: '', password: '' })
    } else if (data) {
      setStaffForm({ full_name: data.full_name, email: data.email, phone: data.phone || '', password: '' })
    }
  }

  const formatPrice = (version: string) => {
    const vNum = parseInt(version.replace('V', ''), 10)
    const prod = products.find(p => p.version === vNum)
    const price = prod ? prod.price : 0
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ap-bg-main)', fontFamily: F, color: 'var(--ap-text-primary)', display: 'flex' }}>
      <ThemeStyles theme={theme} />

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0,
        background: 'var(--ap-bg-sidebar)', borderRight: '1px solid var(--ap-border)',
        backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--ap-border)', cursor: 'pointer' }}
          onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#8b5cf6,#4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--ap-shadow-sm)' }}>
            <Server size={18} color="white" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', color: 'var(--ap-purple-text)' }}>ADMIN PANEL</span>}
        </div>

        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'species', icon: Fish, label: 'Quản lý loài cá' },
            { id: 'devices', icon: Box, label: 'Thiết bị & Kho' },
            { id: 'staff', icon: Users, label: 'Quản lý nhân viên' },
            { id: 'orders', icon: ShoppingCart, label: 'Quản lý Đơn hàng' },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                background: activeTab === item.id ? 'var(--ap-purple-bg)' : 'transparent',
                color: activeTab === item.id ? 'var(--ap-purple-text)' : 'var(--ap-text-secondary)',
                transition: 'all 180ms', whiteSpace: 'nowrap', textAlign: 'left'
              }}
              onMouseEnter={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'var(--ap-hover-bg)'; e.currentTarget.style.color = 'var(--ap-text-primary)' } }}
              onMouseLeave={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ap-text-secondary)' } }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--ap-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-text-primary)' }}>{userInfo.full_name || 'Người dùng'}</div>
              <div style={{ fontSize: 11, color: 'var(--ap-text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.email || ''}</div>
            </div>
          )}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
            textDecoration: 'none', color: 'var(--ap-text-primary)', fontSize: 13, fontWeight: 600,
            transition: 'all 180ms', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ap-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ap-text-primary)'}
          >
            <ArrowLeft size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Về trang chủ'}
          </Link>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600, background: 'transparent', color: '#FF6B6B', transition: 'all 180ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.15)'; e.currentTarget.style.color = '#ff8282' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B6B' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ap-border)', background: 'var(--ap-bg-topbar)', backdropFilter: 'blur(8px)', flexShrink: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ap-text-primary)' }}>
              {activeTab === 'species' && <><Fish size={20} color="var(--ap-purple-text)" /> Quản lý loài cá</>}
              {activeTab === 'devices' && <><Box size={20} color="var(--ap-purple-text)" /> Thiết bị & Quản lý kho</>}
              {activeTab === 'staff' && <><Users size={20} color="var(--ap-purple-text)" /> Quản lý nhân viên</>}
              {activeTab === 'orders' && <><ShoppingCart size={20} color="var(--ap-purple-text)" /> Quản lý Đơn hàng</>}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {loading && <span style={{ fontSize: 11, color: 'var(--ap-text-muted)' }}>Đang tải...</span>}
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 10, border: '1px solid var(--ap-border)',
                background: 'var(--ap-bg-card)', cursor: 'pointer', transition: 'all 200ms',
                color: theme === 'dark' ? '#FFB347' : '#0ea5e9',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--ap-bg-card)'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>

          {/* TAB SPECIES */}
          {activeTab === 'species' && (
            <div style={{ background: 'var(--ap-bg-card)', borderRadius: 16, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-border)' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ap-text-primary)' }}>Danh sách các loài cá</h3>
                <button onClick={() => openSpeciesModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#a78bfa', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  <Plus size={14} /> Thêm loài mới
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: 'var(--ap-table-header)', color: 'var(--ap-text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tên loài</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Nhiệt độ (°C)</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>pH</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>TDS (ppm)</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, width: 100 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {species.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--ap-border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ap-text-primary)' }}>{s.species_name}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{s.temp_min} - {s.temp_max}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{s.ph_min} - {s.ph_max}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{s.tds_min} - {s.tds_max}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                          <button onClick={() => openSpeciesModal('edit', s)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: 4 }}><Edit size={16} /></button>
                          <button onClick={() => openSpeciesModal('delete', s)} style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {species.length === 0 && !loading && (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB DEVICES */}
          {activeTab === 'devices' && (() => {
            const filteredDevices = devices.filter(d => {
              const vMatch = deviceFilterVersion === 'all' || d.firmware_version === deviceFilterVersion;
              let sMatch = true;
              if (deviceFilterStatus === 'active') sMatch = !!d.tank_id;
              else if (deviceFilterStatus === 'bought') sMatch = !d.tank_id && !!d.is_active;
              else if (deviceFilterStatus === 'inactive') sMatch = !d.tank_id && !d.is_active;
              return vMatch && sMatch;
            });
            const totalDevicePages = Math.max(1, Math.ceil(filteredDevices.length / 12));
            const paginatedDevices = filteredDevices.slice(devicePage * 12, (devicePage + 1) * 12);
            
            return (
            <div style={{ background: 'var(--ap-bg-card)', borderRadius: 16, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-border)', flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ap-text-primary)' }}>Quản lý kho thiết bị</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <select
                    value={deviceFilterVersion}
                    onChange={e => { setDeviceFilterVersion(e.target.value); setDevicePage(0); setDevicePageInput('1'); }}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--ap-border)', background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12, fontFamily: F, outline: 'none' }}
                  >
                    <option value="all">Tất cả phiên bản</option>
                    <option value="V1">V1</option>
                    <option value="V2">V2</option>
                    <option value="V3">V3</option>
                    <option value="V4">V4</option>
                  </select>
                  <select
                    value={deviceFilterStatus}
                    onChange={e => { setDeviceFilterStatus(e.target.value); setDevicePage(0); setDevicePageInput('1'); }}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--ap-border)', background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12, fontFamily: F, outline: 'none' }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang dùng</option>
                    <option value="bought">Đã được mua</option>
                    <option value="inactive">Trong kho</option>
                  </select>
                  <button onClick={() => openDeviceModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#a78bfa', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                    <Plus size={14} /> Thêm thiết bị
                  </button>
                </div>
              </div>

              <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, borderBottom: '1px solid var(--ap-border)', background: 'var(--ap-table-header)' }}>
                <span style={{ fontSize: 12, color: 'var(--ap-text-muted)' }}>Tổng: {filteredDevices.length} thiết bị</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ap-text-primary)' }}>
                  <button
                    onClick={() => {
                      if (devicePage > 0) {
                        setDevicePage(p => p - 1);
                        setDevicePageInput((devicePage).toString());
                      }
                    }}
                    disabled={devicePage === 0}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: '1px solid var(--ap-border)', borderRadius: 6, color: devicePage === 0 ? 'var(--ap-text-muted)' : 'var(--ap-text-primary)', cursor: devicePage === 0 ? 'not-allowed' : 'pointer', transition: 'all 200ms' }}
                    onMouseEnter={e => { if (devicePage !== 0) e.currentTarget.style.background = 'var(--ap-hover-bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <ArrowLeft size={14} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--ap-text-muted)' }}>Trang</span>
                    <input
                      value={devicePageInput}
                      onChange={e => setDevicePageInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          let p = parseInt(devicePageInput);
                          if (isNaN(p) || p < 1) p = 1;
                          if (p > totalDevicePages) p = totalDevicePages;
                          setDevicePageInput(p.toString());
                          setDevicePage(p - 1);
                        }
                      }}
                      onBlur={() => {
                        let p = parseInt(devicePageInput);
                        if (isNaN(p) || p < 1) p = 1;
                        if (p > totalDevicePages) p = totalDevicePages;
                        setDevicePageInput(p.toString());
                        setDevicePage(p - 1);
                      }}
                      style={{
                        background: 'var(--ap-bg-card)', border: '1px solid var(--ap-border)', borderRadius: 6,
                        padding: '3px 0', width: 36, textAlign: 'center', fontWeight: 600, color: 'var(--ap-text-primary)', outline: 'none'
                      }}
                    />
                    <span style={{ color: 'var(--ap-text-muted)' }}>của {totalDevicePages}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (devicePage < totalDevicePages - 1) {
                        setDevicePage(p => p + 1);
                        setDevicePageInput((devicePage + 2).toString());
                      }
                    }}
                    disabled={devicePage >= totalDevicePages - 1}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: '1px solid var(--ap-border)', borderRadius: 6, color: devicePage >= totalDevicePages - 1 ? 'var(--ap-text-muted)' : 'var(--ap-text-primary)', cursor: devicePage >= totalDevicePages - 1 ? 'not-allowed' : 'pointer', transition: 'all 200ms' }}
                    onMouseEnter={e => { if (devicePage < totalDevicePages - 1) e.currentTarget.style.background = 'var(--ap-hover-bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, minWidth: 800 }}>
                  <thead>
                    <tr style={{ background: 'var(--ap-table-header)', color: 'var(--ap-text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>MAC Address</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Phiên bản</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trạng thái</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Người sở hữu</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Bể cá</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ngày tạo</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, width: 100 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDevices.map(d => {
                      const status = d.tank_id ? 'Đang dùng' : (d.is_active ? 'Đã được mua' : 'Trong kho')
                      const statusColor = d.tank_id ? '#F59E0B' : (d.is_active ? '#3B82F6' : '#10B981')
                      const statusBg = d.tank_id ? 'rgba(245,158,11,0.1)' : (d.is_active ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)')
                      const statusBorder = d.tank_id ? 'rgba(245,158,11,0.2)' : (d.is_active ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)')
                      const owner = d.tanks?.users ? `${d.tanks.users.full_name} (${d.tanks.users.phone || 'N/A'})` : '-'
                      const tankName = d.tanks?.tank_name || '-'

                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid var(--ap-border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--ap-text-primary)' }}>{d.mac_address}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--ap-table-header)', fontSize: 11, fontWeight: 700, color: 'var(--ap-text-secondary)', border: '1px solid var(--ap-border)' }}>
                              {d.firmware_version}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 100, background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700, border: `1px solid ${statusBorder}` }}>
                              {status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{owner}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{tankName}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{new Date(d.created_at).toLocaleDateString('vi-VN')}</td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                            <button onClick={() => openDeviceModal('edit', d)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: 4 }}><Edit size={16} /></button>
                            <button onClick={() => openDeviceModal('delete', d)} style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredDevices.length === 0 && !loading && (
                      <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có thiết bị nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
          })()}

          {/* TAB STAFF */}
          {activeTab === 'staff' && (
            <div style={{ background: 'var(--ap-bg-card)', borderRadius: 16, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-border)' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ap-text-primary)' }}>Danh sách nhân viên</h3>
                <button onClick={() => openStaffModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#a78bfa', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  <Plus size={14} /> Thêm nhân viên
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: 'var(--ap-table-header)', color: 'var(--ap-text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Họ và tên</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Email</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Số điện thoại</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Chức vụ</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ngày tạo</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, width: 80 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--ap-border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ap-text-primary)' }}>{s.full_name}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{s.email}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{s.phone || '-'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 100, background: 'var(--ap-purple-bg)', color: 'var(--ap-purple-text)', fontSize: 11, fontWeight: 700, border: '1px solid rgba(139,92,246,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Shield size={10} /> Staff
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--ap-text-secondary)' }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                          <button onClick={() => openStaffModal('edit', s)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: 4 }}><Edit size={16} /></button>
                          <button onClick={() => openStaffModal('delete', s)} style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {staff.length === 0 && !loading && (
                      <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có nhân viên nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* TAB ORDERS */}
          {activeTab === 'orders' && (() => {
            const pendingCount = orders.filter(o => o.status === 'pending').length
            return (
              <div style={{ background: 'var(--ap-bg-card)', borderRadius: 16, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ap-text-primary)' }}>Danh sách đơn hàng</h3>
                    {pendingCount > 0 && (
                      <span style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontSize: 11, fontWeight: 700 }}>
                        {pendingCount} chờ duyệt
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ap-text-muted)' }}>{orders.length} đơn hàng</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: 'var(--ap-table-header)', color: 'var(--ap-text-muted)' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Mã đơn</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Khách hàng</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Sản phẩm</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tổng tiền</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Thanh toán</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trạng thái</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ngày đặt</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, width: 160 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--ap-border)', transition: 'background 160ms' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--ap-purple-text)', fontSize: 12 }}>{order.id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 2 }}>{order.customerName}</div>
                            <div style={{ fontSize: 11, color: 'var(--ap-text-muted)' }}>{order.phone}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--ap-table-header)', fontSize: 11, fontWeight: 800, color: 'var(--ap-text-secondary)', border: '1px solid var(--ap-border)', display: 'inline-block', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.productVersion}>
                              {order.productVersion}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ap-text-primary)' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {order.paymentMethod === 'COD'
                              ? <span style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316', fontSize: 11, fontWeight: 700 }}>COD</span>
                              : <span style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9', fontSize: 11, fontWeight: 700 }}>Chuyển khoản</span>
                            }
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {order.status === 'pending'
                              ? <span style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontSize: 11, fontWeight: 700 }}>⏳ Chờ duyệt</span>
                              : <span style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 11, fontWeight: 700 }}>✓ Đã duyệt</span>
                            }
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--ap-text-muted)', fontSize: 12 }}>
                            {new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                onClick={() => setDetailsModal({ show: true, order })}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'filter 160ms', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                              >
                                <Eye size={12} /> Chi tiết
                              </button>
                              {order.paymentMethod === 'Chuyển khoản' && (
                                <button
                                  onClick={() => setReceiptModal({ show: true, order })}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'filter 160ms', whiteSpace: 'nowrap' }}
                                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                  <FileText size={12} /> Biên lai
                                </button>
                              )}
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => { setApproveModal({ show: true, order }); setSelectedTaskType('delivery') }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, background: '#a78bfa', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F, transition: 'filter 160ms', whiteSpace: 'nowrap' }}
                                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                  <CheckCheck size={13} /> Duyệt đơn
                                </button>
                              )}
                              {order.status === 'approved' && (
                                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCheck size={13} /> Đã xử lý
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}
        </div>
      </main>

      {/* Custom Notification */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        zIndex: 2000,
        background: 'var(--ap-bg-card)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #00A896',
        color: '#00A896',
        padding: '12px 24px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        opacity: notification.show ? 1 : 0,
        transform: notification.show ? 'translate(-50%, 0)' : 'translate(-50%, -20px)',
        transition: 'all 300ms ease',
        pointerEvents: notification.show ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 32px rgba(0, 168, 150, 0.2)'
      }}>
        <CheckCircle size={18} />
        {notification.msg}
      </div>

      {/* Modals */}
      {speciesModal.show && (
        <Dialog
          title={speciesModal.mode === 'add' ? 'Thêm loài cá mới' : speciesModal.mode === 'edit' ? 'Sửa loài cá' : 'Xóa loài cá'}
          message={speciesModal.mode === 'delete' ? `Bạn có chắc chắn muốn xóa loài cá "${speciesModal.data?.species_name}"?` : undefined}
          error={errorMsg}
          confirmText={speciesModal.mode === 'delete' ? 'Xóa' : 'Lưu'}
          confirmColor={speciesModal.mode === 'delete' ? '#FF6B6B' : '#a78bfa'}
          onConfirm={saveSpecies}
          onCancel={() => setSpeciesModal({ show: false, mode: 'add' })}
        >
          {speciesModal.mode !== 'delete' && (
            <>
              <Input label="Tên loài cá" value={spForm.species_name} onChange={(e: any) => setSpForm({ ...spForm, species_name: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Temp Min (°C)" type="number" step="0.1" value={spForm.temp_min} onChange={(e: any) => setSpForm({ ...spForm, temp_min: parseFloat(e.target.value) })} />
                <Input label="Temp Max (°C)" type="number" step="0.1" value={spForm.temp_max} onChange={(e: any) => setSpForm({ ...spForm, temp_max: parseFloat(e.target.value) })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="pH Min" type="number" step="0.1" value={spForm.ph_min} onChange={(e: any) => setSpForm({ ...spForm, ph_min: parseFloat(e.target.value) })} />
                <Input label="pH Max" type="number" step="0.1" value={spForm.ph_max} onChange={(e: any) => setSpForm({ ...spForm, ph_max: parseFloat(e.target.value) })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="TDS Min (ppm)" type="number" value={spForm.tds_min} onChange={(e: any) => setSpForm({ ...spForm, tds_min: parseFloat(e.target.value) })} />
                <Input label="TDS Max (ppm)" type="number" value={spForm.tds_max} onChange={(e: any) => setSpForm({ ...spForm, tds_max: parseFloat(e.target.value) })} />
              </div>
            </>
          )}
        </Dialog>
      )}

      {deviceModal.show && (
        <Dialog
          title={deviceModal.mode === 'add' ? 'Thêm thiết bị mới' : deviceModal.mode === 'edit' ? 'Sửa thiết bị' : 'Xóa thiết bị'}
          message={deviceModal.mode === 'delete' ? `Bạn có chắc chắn muốn xóa thiết bị có MAC "${deviceModal.data?.mac_address}"?` : undefined}
          error={errorMsg}
          confirmText={deviceModal.mode === 'delete' ? 'Xóa' : 'Lưu'}
          confirmColor={deviceModal.mode === 'delete' ? '#FF6B6B' : '#a78bfa'}
          onConfirm={saveDevice}
          onCancel={() => setDeviceModal({ show: false, mode: 'add' })}
        >
          {deviceModal.mode !== 'delete' && (
            <>
              <Input label="MAC Address" value={devForm.mac_address} onChange={(e: any) => setDevForm({ ...devForm, mac_address: e.target.value })} placeholder="VD: AA:BB:CC:DD:EE:FF" />
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 6 }}>Phiên bản</label>
                <select style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ap-input-border)',
                  background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: F, outline: 'none',
                  transition: 'border-color 160ms'
                }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-purple-text)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--ap-input-border)'}
                  value={devForm.firmware_version} onChange={(e) => setDevForm({ ...devForm, firmware_version: e.target.value })}>
                  <option value="V1" style={{ color: '#000' }}>V1</option>
                  <option value="V2" style={{ color: '#000' }}>V2</option>
                  <option value="V3" style={{ color: '#000' }}>V3</option>
                  <option value="V4" style={{ color: '#000' }}>V4</option>
                </select>
              </div>

              {/* Auto price calculation display */}
              <div style={{ padding: 16, borderRadius: 12, background: 'var(--ap-purple-bg)', border: '1px dashed rgba(139,92,246,0.3)', marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ap-text-secondary)' }}>Giá bán dự kiến ({devForm.firmware_version}):</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ap-purple-text)' }}>{formatPrice(devForm.firmware_version)}</span>
                </div>
              </div>
            </>
          )}
        </Dialog>
      )}

      {staffModal.show && (
        <Dialog
          title={staffModal.mode === 'add' ? 'Thêm nhân viên mới' : staffModal.mode === 'edit' ? 'Sửa thông tin nhân viên' : 'Xóa nhân viên'}
          message={staffModal.mode === 'delete' ? `Bạn có chắc chắn muốn xóa nhân viên "${staffModal.data?.full_name}"?` : undefined}
          error={errorMsg}
          confirmText={staffModal.mode === 'delete' ? 'Xóa' : staffModal.mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
          confirmColor={staffModal.mode === 'delete' ? '#FF6B6B' : '#a78bfa'}
          onConfirm={saveStaff}
          onCancel={() => setStaffModal({ show: false, mode: 'add' })}
        >
          {staffModal.mode !== 'delete' && (
            <>
              <Input label="Họ và tên" placeholder="Nhập họ và tên" value={staffForm.full_name} onChange={(e: any) => setStaffForm({ ...staffForm, full_name: e.target.value })} />
              {staffModal.mode === 'add' && (
                <Input label="Email" type="email" placeholder="Nhập địa chỉ email" value={staffForm.email} onChange={(e: any) => setStaffForm({ ...staffForm, email: e.target.value })} />
              )}
              <Input label="Số điện thoại" placeholder="Nhập số điện thoại" value={staffForm.phone} onChange={(e: any) => setStaffForm({ ...staffForm, phone: e.target.value })} />
              {staffModal.mode === 'add' && (
                <Input label="Mật khẩu" type="password" placeholder="Nhập mật khẩu (min 6 ký tự)" value={staffForm.password} onChange={(e: any) => setStaffForm({ ...staffForm, password: e.target.value })} />
              )}
            </>
          )}
        </Dialog>
      )}

      {/* Approve Order Modal */}
      {approveModal.show && approveModal.order && (
        <Dialog
          title="Duyệt đơn hàng"
          error=""
          confirmText="Xác nhận & Giao việc"
          cancelText="Hủy"
          confirmColor="#10B981"
          onConfirm={async () => {
            const { error } = await supabase.from('orders').update({ status: 'approved' }).eq('id', approveModal.order!.id)
            if (error) {
              alert('Lỗi duyệt đơn: ' + error.message)
              return
            }
            setOrders(prev => prev.map(o => o.id === approveModal.order!.id ? { ...o, status: 'approved' } : o))
            const taskLabel = TASK_TYPES.find(t => t.value === selectedTaskType)?.label || ''
            alert(`✅ Đã duyệt đơn ${approveModal.order!.id}!\n\nTask "${taskLabel}" đã được tạo và giao cho Staff.\nKhách hàng: ${approveModal.order!.customerName}\nĐịa chỉ: ${approveModal.order!.address}`)
            setApproveModal({ show: false, order: null })
          }}
          onCancel={() => setApproveModal({ show: false, order: null })}
        >
          {/* Order summary */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--ap-table-header)', border: '1px solid var(--ap-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Mã đơn</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--ap-purple-text)' }}>{approveModal.order.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Khách hàng</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>{approveModal.order.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Sản phẩm</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>AquaCare {approveModal.order.productVersion}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Tổng tiền</span>
              <span style={{ fontWeight: 700, color: '#10B981' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(approveModal.order.totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Địa chỉ</span>
              <span style={{ fontWeight: 500, color: 'var(--ap-text-secondary)', maxWidth: 200, textAlign: 'right' }}>{approveModal.order.address}</span>
            </div>
          </div>

          {/* Task type selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 8 }}>Loại công việc giao cho Staff</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {TASK_TYPES.map(task => {
                const isSelected = selectedTaskType === task.value
                const TaskIcon = task.icon
                return (
                  <button
                    key={task.value}
                    onClick={() => setSelectedTaskType(task.value)}
                    style={{
                      flex: 1, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', fontFamily: F,
                      border: `1.5px solid ${isSelected ? '#10B981' : 'var(--ap-border)'}`,
                      background: isSelected ? 'rgba(16,185,129,0.1)' : 'var(--ap-btn-cancel)',
                      color: isSelected ? '#10B981' : 'var(--ap-text-secondary)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 160ms',
                    }}
                  >
                    <TaskIcon size={20} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{task.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Dialog>
      )}

      {/* Receipt Modal */}
      {receiptModal.show && receiptModal.order && (
        <Dialog
          title="Biên lai chuyển khoản"
          confirmText="Đóng"
          cancelText="Tải xuống"
          confirmColor="#0ea5e9"
          onConfirm={() => setReceiptModal({ show: false, order: null })}
          onCancel={() => setReceiptModal({ show: false, order: null })}
        >
          <div style={{ padding: 16, background: 'var(--ap-bg-card)', borderRadius: 12, border: '1px solid var(--ap-border)', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={48} color="#10B981" />
            </div>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--ap-text-primary)' }}>Đã thanh toán thành công</h4>
            <div style={{ fontSize: 13, color: 'var(--ap-text-secondary)', display: 'grid', gap: 8, textAlign: 'left', background: 'var(--ap-hover-bg)', padding: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mã giao dịch:</span> <strong style={{ color: 'var(--ap-text-primary)' }}>TXN-{receiptModal.order.id.toString().slice(0, 6)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Khách hàng:</span> <strong style={{ color: 'var(--ap-text-primary)' }}>{receiptModal.order.customerName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Số tiền:</span> <strong style={{ color: '#0ea5e9' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(receiptModal.order.totalPrice)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ngày chuyển:</span> <strong style={{ color: 'var(--ap-text-primary)' }}>{new Date(receiptModal.order.createdAt).toLocaleDateString('vi-VN')}</strong></div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Details Modal */}
      {detailsModal.show && detailsModal.order && (
        <Dialog
          title="Chi tiết đơn hàng"
          confirmText="Đóng"
          cancelText=""
          confirmColor="#a78bfa"
          onConfirm={() => setDetailsModal({ show: false, order: null })}
          onCancel={() => setDetailsModal({ show: false, order: null })}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--ap-purple-text)' }}>{detailsModal.order.id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Khách hàng:</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>{detailsModal.order.customerName}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Email:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{detailsModal.order.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>SĐT:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{detailsModal.order.phone}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Địa chỉ:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{detailsModal.order.address}</span>
            </div>
            {detailsModal.order.note && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'var(--ap-text-muted)' }}>Ghi chú:</span>
                <span style={{ color: '#F59E0B', fontStyle: 'italic', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: 6 }}>"{detailsModal.order.note}"</span>
              </div>
            )}
            <div style={{ height: 1, background: 'var(--ap-border)', margin: '4px 0' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Sản phẩm:</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>{detailsModal.order.productVersion}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Số lượng:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{detailsModal.order.totalQuantity} sản phẩm</span>
            </div>
            {detailsModal.order.deviceMacs && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <span style={{ color: 'var(--ap-text-muted)' }}>Mã MAC thiết bị (Cần giao):</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: 6, display: 'inline-block', width: 'fit-content' }}>{detailsModal.order.deviceMacs}</span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Tổng tiền:</span>
              <span style={{ fontWeight: 700, color: '#10B981', fontSize: 16 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailsModal.order.totalPrice)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Ngày đặt:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{new Date(detailsModal.order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </Dialog>
      )}

    </div>
  )
}
