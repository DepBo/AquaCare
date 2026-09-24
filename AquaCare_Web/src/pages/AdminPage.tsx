import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Fish, Box, LogOut, ArrowLeft,
  Plus, Edit, Trash2, X, Users, ShoppingCart,
  FileText, Truck, CheckCircle, ArrowRight, Eye, EyeOff, AlertTriangle, RefreshCw, User, Search
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { InnerMoonToggle } from '../components/InnerMoonToggle'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

const getInitialsAvatar = (name: string) => {
  if (!name) return 'A'
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return words[0][0].toUpperCase()
}

// ─── Minimalist Theme Setup (Single Accent Blue, Uncluttered & Clean) ─────────────────────────────────
const ThemeStyles = ({ theme }: { theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark'
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      :root[data-theme="${theme}"] {
        --ap-bg-main: ${isDark ? '#141414' : '#f8fafc'};
        --ap-bg-topbar: ${isDark ? '#1f1f1f' : '#ffffff'};
        --ap-bg-card: ${isDark ? '#1f1f1f' : '#ffffff'};
        --ap-bg-modal: ${isDark ? '#222225' : '#ffffff'};
        --ap-bg-subtle: ${isDark ? '#28282b' : '#f1f5f9'};
        
        --ap-text-primary: ${isDark ? '#f4f4f5' : '#0f172a'};
        --ap-text-secondary: ${isDark ? '#a1a1aa' : '#334155'};
        --ap-text-muted: ${isDark ? '#71717a' : '#475569'};
        
        --ap-border: ${isDark ? '#333333' : '#cbd5e1'};
        --ap-border-hover: ${isDark ? '#444444' : '#94a3b8'};
        
        --ap-hover-bg: ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'};
        --ap-hover-danger: ${isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'};
        
        --ap-input-bg: ${isDark ? '#181818' : '#ffffff'};
        --ap-input-border: ${isDark ? '#3b3b3e' : '#94a3b8'};
        
        --ap-shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)'};
        --ap-shadow-sm: ${isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'};
        
        --ap-table-header: ${isDark ? '#27272a' : '#f1f5f9'};
        
        --ap-primary: #0284c7;
        --ap-primary-hover: #0369a1;
        --ap-primary-bg: ${isDark ? 'rgba(2,132,199,0.2)' : '#e0f2fe'};
        
        --ap-modal-overlay: ${isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.4)'};
        --ap-btn-cancel: ${isDark ? '#2a2a2d' : '#e2e8f0'};
      }
      select option {
        background: var(--ap-bg-card);
        color: var(--ap-text-primary);
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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

type StaffRole = 'staff_warehouse' | 'staff_shipper' | 'staff_support' | 'staff_maintenance' | 'staff'

const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  staff_warehouse:   'Nhân viên kho',
  staff_shipper:     'Nhân viên giao hàng',
  staff_support:     'Nhân viên hỗ trợ',
  staff_maintenance: 'Nhân viên bảo trì',
  staff:             'Staff',
}

interface Staff {
  id: string
  full_name: string
  email: string
  phone: string
  role: StaffRole
  created_at: string
}

interface SubscriptionPlan {
  id: number
  name: string
  plan_type: 'free' | 'premium' | 'enterprise'
  price: number
  duration_months: number
  max_tanks: number
  smart_device_setup: boolean
  history_days: number
  is_active: boolean
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
  userId: string
  customerName: string
  phone: string
  email: string
  address: string
  note: string
  productVersion: string
  deviceMacs?: string
  totalQuantity: number
  totalPrice: number
  paymentMethod: 'COD' | 'Chuyển khoản'
  status: 'pending' | 'approved' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  createdAt: string
}

function Dialog({
  title, message, error, confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmColor = 'var(--ap-primary)', onConfirm, onCancel, loading = false, children
}: any) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--ap-modal-overlay)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--ap-bg-modal)',
        border: '1px solid var(--ap-border)',
        borderRadius: 12, padding: '24px 28px', width: 440, maxWidth: '92vw',
        boxShadow: 'var(--ap-shadow)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--ap-border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ap-text-primary)' }}>{title}</h3>
          <button onClick={onCancel} disabled={loading} style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--ap-text-muted)', opacity: loading ? 0.5 : 1 }}>
            <X size={18} />
          </button>
        </div>
        {message && <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--ap-text-primary)', lineHeight: 1.5 }}>{message}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
        {error && <p style={{ margin: '14px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600, textAlign: 'center' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          {cancelText && (
            <button onClick={onCancel} disabled={loading} style={{
              flex: 1, padding: '10px 0', borderRadius: 6, border: '1px solid var(--ap-border)',
              background: 'var(--ap-btn-cancel)', color: 'var(--ap-text-primary)', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: F, fontWeight: 600,
              transition: 'background 160ms', opacity: loading ? 0.5 : 1
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--ap-hover-bg)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--ap-btn-cancel)' }}
            >{cancelText}</button>
          )}
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
            background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: F,
            transition: 'filter 160ms', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1)' }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
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
          width: '100%', padding: '9px 12px', paddingRight: isPassword ? 40 : 12, borderRadius: 6, border: '1px solid var(--ap-input-border)',
          background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: F, outline: 'none',
          transition: 'border-color 160ms', boxSizing: 'border-box'
        }}
          type={actualType}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-primary)'}
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
  const [activeTab, setActiveTab] = useState<'species' | 'devices' | 'staff' | 'orders' | 'subscriptions'>('species')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [approveModal, setApproveModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [receiptModal, setReceiptModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [detailsModal, setDetailsModal] = useState<{ show: boolean, order: Order | null }>({ show: false, order: null })
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'light')

  const [species, setSpecies] = useState<FishSpecies[]>([])
  const [speciesSearch, setSpeciesSearch] = useState('')
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceSearch, setDeviceSearch] = useState('')
  const [devicePage, setDevicePage] = useState(0)
  const [devicePageInput, setDevicePageInput] = useState('1')
  const [deviceFilterVersion, setDeviceFilterVersion] = useState('all')
  const [deviceFilterStatus, setDeviceFilterStatus] = useState('all')

  const [products, setProducts] = useState<{version: number, price: number}[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  const [macCustomerMap, setMacCustomerMap] = useState<Record<string, any>>({})
  const [selectedBuyerModal, setSelectedBuyerModal] = useState<any | null>(null)

  // Modals
  const [speciesModal, setSpeciesModal] = useState<{ show: boolean, data?: FishSpecies, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [spForm, setSpForm] = useState<Partial<FishSpecies>>({})

  const [deviceModal, setDeviceModal] = useState<{ show: boolean, data?: Device, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [devForm, setDevForm] = useState<{ mac_address: string, firmware_version: string }>({ mac_address: '', firmware_version: 'V1' })

  const [staffSearch, setStaffSearch] = useState('')
  const [staffRoleFilter, setStaffRoleFilter] = useState('all')

  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilterStatus, setOrderFilterStatus] = useState('all')

  const [staffModal, setStaffModal] = useState<{ show: boolean, data?: Staff, mode: 'add' | 'edit' | 'delete' }>({ show: false, mode: 'add' })
  const [staffForm, setStaffForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'staff_warehouse' as StaffRole })

  const [subModal, setSubModal] = useState<{ show: boolean, data?: SubscriptionPlan, mode: 'add' }>({ show: false, mode: 'add' })
  const [subForm, setSubForm] = useState<Partial<SubscriptionPlan>>({
    name: '', plan_type: 'premium', price: 80000, duration_months: 1, max_tanks: 5, smart_device_setup: true, history_days: 365
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [notification, setNotification] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' })

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, msg, type })
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

    const { data: staffData } = await supabase.from('users').select('*').like('role', 'staff%').order('created_at', { ascending: false })
    if (staffData) setStaff(staffData)

    const { data: ordersData } = await supabase.from('orders').select('*, order_items(product_name, quantity, device_macs)').order('created_at', { ascending: false })
    if (ordersData) {
      const macMap: Record<string, any> = {}
      ordersData.forEach((o: any) => {
        if (o.order_items) {
          o.order_items.forEach((item: any) => {
            const macs = item.device_macs || []
            if (Array.isArray(macs)) {
              macs.forEach((m: string) => {
                if (m && typeof m === 'string') {
                  macMap[m.trim().toUpperCase()] = {
                    orderId: o.id,
                    customerName: o.shipping_name,
                    phone: o.shipping_phone,
                    address: o.shipping_address,
                    email: o.shipping_email || 'N/A',
                    productName: item.product_name,
                    createdAt: o.created_at
                  }
                }
              })
            }
          })
        }
      })
      setMacCustomerMap(macMap)

      const mappedOrders = ordersData.map((o: any) => ({
        id: o.id,
        userId: o.user_id,
        customerName: o.shipping_name,
        phone: o.shipping_phone,
        email: o.shipping_email || 'N/A',
        address: o.shipping_address,
        note: o.note || '',
        productVersion: o.order_items && o.order_items.length > 0 ? o.order_items.map((i: any) => i.product_name).join(', ') : 'N/A',
        deviceMacs: o.order_items && o.order_items.length > 0 ? o.order_items.flatMap((i: any) => i.device_macs || []).join(', ') : '',
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

    const { data: subData } = await supabase.from('subscription_plans').select('*').order('id')
    if (subData) setSubscriptionPlans(subData)

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
    if (saving) return
    setErrorMsg('')
    if (!spForm.species_name || spForm.temp_min === undefined || spForm.temp_min === null || spForm.temp_max === undefined || spForm.temp_max === null || spForm.ph_min === undefined || spForm.ph_min === null || spForm.ph_max === undefined || spForm.ph_max === null || spForm.tds_min === undefined || spForm.tds_min === null || spForm.tds_max === undefined || spForm.tds_max === null) {
      return showNotification('Vui lòng điền đầy đủ tất cả thông tin', 'error')
    }
    setSaving(true)
    try {
      if (speciesModal.mode === 'add') {
        const { error } = await supabase.from('fish_species').insert(spForm)
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) return showNotification('Tên loài cá này đã tồn tại!', 'error')
          return showNotification(error.message, 'error')
        }
        showNotification('Thêm loài cá thành công!')
      } else if (speciesModal.mode === 'edit' && speciesModal.data) {
        const { error } = await supabase.from('fish_species').update(spForm).eq('id', speciesModal.data.id)
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) return showNotification('Tên loài cá này đã tồn tại!', 'error')
          return showNotification(error.message, 'error')
        }
        showNotification('Cập nhật loài cá thành công!')
      } else if (speciesModal.mode === 'delete' && speciesModal.data) {
        const { error } = await supabase.from('fish_species').delete().eq('id', speciesModal.data.id)
        if (error) return showNotification(error.message, 'error')
        showNotification('Xóa loài cá thành công!')
      }
      setSpeciesModal({ show: false, mode: 'add' })
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const openSpeciesModal = (mode: 'add' | 'edit' | 'delete', data?: FishSpecies) => {
    setSpeciesModal({ show: true, mode, data })
    if (mode === 'add') setSpForm({ species_name: '', temp_min: 24, temp_max: 30, ph_min: 6.5, ph_max: 7.5, tds_min: 100, tds_max: 300 })
    else if (data) setSpForm(data)
  }

  // ---- Devices CRUD ----
  const saveDevice = async () => {
    if (saving) return
    setErrorMsg('')
    if (deviceModal.mode === 'add') {
      if (!devForm.mac_address) return showNotification('Vui lòng nhập MAC Address', 'error')
      
      const macs = devForm.mac_address
        .split(/[\n,]+/)
        .map(m => m.trim().toUpperCase())
        .filter(m => m.length > 0)

      if (macs.length === 0) return showNotification('MAC Address không hợp lệ', 'error')

      const uniqueMacs = Array.from(new Set(macs))
      if (uniqueMacs.length < macs.length) {
        return showNotification('Phát hiện mã MAC bị trùng lặp trong danh sách nhập!', 'error')
      }

      // Check DB for existing MACs
      const macsLower = uniqueMacs.map(m => m.toLowerCase())
      const { data: existingDevs } = await supabase
        .from('devices')
        .select('mac_address')
        .in('mac_address', [...uniqueMacs, ...macsLower])

      if (existingDevs && existingDevs.length > 0) {
        const dupList = existingDevs.map((d: any) => d.mac_address).join(', ')
        return showNotification(`Mã MAC đã tồn tại trong hệ thống: ${dupList}`, 'error')
      }

      const devicesToInsert = uniqueMacs.map(mac => ({
        mac_address: mac,
        firmware_version: devForm.firmware_version,
        is_active: false
      }))

      setSaving(true)
      try {
        const { error } = await supabase.from('devices').insert(devicesToInsert)
        
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            return showNotification(`Có MAC Address đã tồn tại trong hệ thống!`, 'error')
          }
          return showNotification(error.message, 'error')
        }
        showNotification(`Đã thêm thành công ${uniqueMacs.length} thiết bị!`)
      } finally {
        setSaving(false)
      }
    } else if (deviceModal.mode === 'edit' && deviceModal.data) {
      const newMac = devForm.mac_address.trim().toUpperCase()
      const { data: existingDevs } = await supabase
        .from('devices')
        .select('id, mac_address')
        .or(`mac_address.eq.${newMac},mac_address.eq.${newMac.toLowerCase()}`)
        .neq('id', deviceModal.data.id)

      if (existingDevs && existingDevs.length > 0) {
        return showNotification(`Mã MAC "${newMac}" đã tồn tại trên một thiết bị khác!`, 'error')
      }

      setSaving(true)
      try {
        const { error } = await supabase.from('devices').update({
          mac_address: newMac,
          firmware_version: devForm.firmware_version,
        }).eq('id', deviceModal.data.id)
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            return showNotification('MAC Address này đã tồn tại trong hệ thống!', 'error')
          }
          return showNotification(error.message, 'error')
        }
        showNotification('Cập nhật thiết bị thành công!')
      } finally {
        setSaving(false)
      }
    } else if (deviceModal.mode === 'delete' && deviceModal.data) {
      setSaving(true)
      try {
        const { error } = await supabase.from('devices').delete().eq('id', deviceModal.data.id)
        if (error) return showNotification(error.message, 'error')
        showNotification('Xóa thiết bị thành công!')
      } finally {
        setSaving(false)
      }
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
    if (saving) return
    setErrorMsg('')
    setSaving(true)
    try {
      if (staffModal.mode === 'add') {
        if (!staffForm.email || !staffForm.password || !staffForm.full_name || !staffForm.phone) return showNotification('Vui lòng điền đủ thông tin bắt buộc (kể cả số điện thoại)', 'error')

        const { data: existingPhone } = await supabase.from('users').select('id').eq('phone', staffForm.phone.trim()).maybeSingle()
        if (existingPhone) return showNotification('Số điện thoại này đã được sử dụng!', 'error')

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: staffForm.email,
          password: staffForm.password,
        })

        if (authError) {
          if (authError.message.includes('already registered')) return showNotification('Email này đã được sử dụng!', 'error')
          return showNotification(authError.message, 'error')
        }

        if (authData.user) {
          const { error: dbError } = await supabase.from('users').update({
            full_name: staffForm.full_name,
            phone: staffForm.phone,
            role: staffForm.role
          }).eq('id', authData.user.id)
          if (dbError) {
            if (dbError.code === '23505' || dbError.message.includes('unique')) {
              if (dbError.message.includes('phone')) return showNotification('Số điện thoại này đã được sử dụng!', 'error')
              if (dbError.message.includes('email')) return showNotification('Email này đã được sử dụng!', 'error')
            }
            return showNotification(dbError.message, 'error')
          }
          showNotification('Thêm nhân viên thành công!')
        }
      } else if (staffModal.mode === 'edit' && staffModal.data) {
        if (!staffForm.full_name || !staffForm.phone) return showNotification('Vui lòng điền đủ họ tên và số điện thoại', 'error')
        const { error: dbError } = await supabase.from('users').update({
          full_name: staffForm.full_name,
          phone: staffForm.phone,
          role: staffForm.role,
        }).eq('id', staffModal.data.id)
        if (dbError) {
          if (dbError.code === '23505' || dbError.message.includes('unique')) {
            if (dbError.message.includes('phone')) return showNotification('Số điện thoại này đã được sử dụng!', 'error')
            if (dbError.message.includes('email')) return showNotification('Email này đã được sử dụng!', 'error')
          }
          return showNotification(dbError.message, 'error')
        }
        showNotification('Cập nhật nhân viên thành công!')
      } else if (staffModal.mode === 'delete' && staffModal.data) {
        const { error } = await supabase.from('users').delete().eq('id', staffModal.data.id)
        if (error) return showNotification(error.message, 'error')
        showNotification('Xóa nhân viên thành công!')
      }
      setStaffModal({ show: false, mode: 'add' })
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const openStaffModal = (mode: 'add' | 'edit' | 'delete', data?: Staff) => {
    setStaffModal({ show: true, mode, data })
    if (mode === 'add') {
      setStaffForm({ full_name: '', email: '', phone: '', password: '', role: 'staff_warehouse' })
    } else if (data) {
      setStaffForm({ full_name: data.full_name, email: data.email, phone: data.phone || '', password: '', role: data.role || 'staff_warehouse' })
    }
  }

  // ---- Subscription CRUD ----
  const saveSubscription = async () => {
    if (saving) return
    setErrorMsg('')
    if (subModal.mode === 'add') {
      if (!subForm.name || !subForm.plan_type || subForm.price === undefined || subForm.price === null || subForm.duration_months === undefined || subForm.duration_months === null || subForm.max_tanks === undefined || subForm.max_tanks === null || subForm.history_days === undefined || subForm.history_days === null) {
        return showNotification('Vui lòng điền đầy đủ tất cả thông tin gói cước', 'error')
      }
      
      setSaving(true)
      try {
        const { error } = await supabase.from('subscription_plans').insert({
          name: subForm.name,
          plan_type: subForm.plan_type,
          price: subForm.price,
          duration_months: subForm.duration_months,
          max_tanks: subForm.max_tanks,
          smart_device_setup: subForm.smart_device_setup,
          history_days: subForm.history_days
        })
        if (error) return showNotification(error.message, 'error')
        showNotification('Thêm gói cước thành công!')
      } finally {
        setSaving(false)
      }
    }
    setSubModal({ show: false, mode: 'add' })
    fetchData()
  }

  const openSubModal = (mode: 'add') => {
    setSubModal({ show: true, mode })
    setSubForm({ name: '', plan_type: 'premium', price: 80000, duration_months: 1, max_tanks: 5, smart_device_setup: true, history_days: 365 })
  }

  const formatPrice = (version: string) => {
    const vNum = parseInt(version.replace('V', ''), 10)
    const prod = products.find(p => p.version === vNum)
    const price = prod ? prod.price : 0
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length

  const NAV_ITEMS = [
    { id: 'species', label: 'Quản lý loài cá', icon: Fish },
    { id: 'devices', label: 'Thiết bị & Kho', icon: Box },
    { id: 'staff', label: 'Quản lý nhân viên', icon: Users },
    { id: 'orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart, badge: pendingOrdersCount },
    { id: 'subscriptions', label: 'Gói cước', icon: FileText },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ap-bg-main)', fontFamily: F, color: 'var(--ap-text-primary)', display: 'flex', flexDirection: 'column' }}>
      <ThemeStyles theme={theme} />

      {/* ── Top Header / Minimalist Navigation Tier ── */}
      <header style={{
        background: 'var(--ap-bg-topbar)',
        borderBottom: '1px solid var(--ap-border)',
        boxShadow: 'none',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          {/* Brand Identity - Minimalist Clean */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ap-primary)', letterSpacing: '-0.02em' }}>
              AquaCare
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ap-text-muted)' }}>
              | Admin
            </span>
          </div>

          {/* Clean Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', overflowX: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: '100%', padding: '0 14px', border: 'none', cursor: 'pointer',
                    fontFamily: F, fontSize: 13, fontWeight: isActive ? 700 : 500,
                    background: 'transparent',
                    color: isActive ? 'var(--ap-primary)' : 'var(--ap-text-secondary)',
                    borderBottom: isActive ? '2px solid var(--ap-primary)' : '2px solid transparent',
                    transition: 'all 160ms', position: 'relative', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--ap-text-primary)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--ap-text-secondary)' }}
                >
                  <Icon size={14} />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 100, background: 'var(--ap-primary)', color: '#fff',
                      fontSize: 10, fontWeight: 700, lineHeight: 1.2
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {/* User Avatar with initials + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)', flexShrink: 0
              }}>
                {getInitialsAvatar(userInfo.full_name || userInfo.name || 'Admin')}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ap-text-primary)' }}>
                {userInfo.full_name || 'Admin'}
              </span>
            </div>

            {/* Theme Switcher (Inner Moon Animated) */}
            <InnerMoonToggle
              toggled={theme === 'dark'}
              onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              borderColorVar="var(--ap-border)"
              bgCardVar="var(--ap-bg-card)"
              hoverBgVar="var(--ap-hover-bg)"
              textColorVar="var(--ap-text-secondary)"
            />

            {/* Home Link */}
            <Link to="/" title="Về trang chủ" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 6, border: '1px solid var(--ap-border)',
              background: 'var(--ap-bg-card)', color: 'var(--ap-text-secondary)', textDecoration: 'none',
              transition: 'all 180ms'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ap-hover-bg)'; e.currentTarget.style.color = 'var(--ap-text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--ap-bg-card)'; e.currentTarget.style.color = 'var(--ap-text-secondary)' }}
            >
              <ArrowLeft size={15} />
            </Link>

            {/* Logout (Red Tinted Button) */}
            <button onClick={handleLogout} title="Đăng xuất" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 6, border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: F,
              fontSize: 13, fontWeight: 600, background: 'rgba(239, 68, 68, 0.08)',
              color: '#dc2626', transition: 'all 180ms'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5' }}
            >
              <LogOut size={14} />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main style={{ flex: 1, maxWidth: 1320, width: '100%', margin: '0 auto', padding: '24px 24px 40px', boxSizing: 'border-box' }}>

        {/* Page Header Bar (Clean Single-Level) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ap-text-primary)' }}>
              {activeTab === 'species' && 'Quản lý loài cá'}
              {activeTab === 'devices' && 'Thiết bị & Kho'}
              {activeTab === 'staff' && 'Quản lý nhân viên'}
              {activeTab === 'orders' && 'Quản lý Đơn hàng'}
              {activeTab === 'subscriptions' && 'Gói cước dịch vụ'}
            </h1>
            <div style={{ fontSize: 12, color: 'var(--ap-text-muted)', marginTop: 2 }}>
              Cổng thông tin quản trị hệ thống AquaCare
            </div>
          </div>

          {/* Primary Action Button (Single Accent Blue) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {loading && (
              <span style={{ fontSize: 12, color: 'var(--ap-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải...
              </span>
            )}

            {activeTab === 'species' && (
              <button onClick={() => openSpeciesModal('add')} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                background: 'var(--ap-primary)', color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms'
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Plus size={14} /> Thêm loài cá
              </button>
            )}

            {activeTab === 'devices' && (
              <button onClick={() => openDeviceModal('add')} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                background: 'var(--ap-primary)', color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms'
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Plus size={14} /> Thêm thiết bị
              </button>
            )}

            {activeTab === 'staff' && (
              <button onClick={() => openStaffModal('add')} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                background: 'var(--ap-primary)', color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms'
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Plus size={14} /> Thêm nhân viên
              </button>
            )}

            {activeTab === 'subscriptions' && (
              <button onClick={() => openSubModal('add')} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                background: 'var(--ap-primary)', color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'filter 160ms'
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Plus size={14} /> Thêm gói cước
              </button>
            )}
          </div>
        </div>

        {/* TAB SPECIES */}
        {activeTab === 'species' && (() => {
          const filteredSpecies = species.filter(s =>
            s.species_name.toLowerCase().includes(speciesSearch.toLowerCase().trim())
          );
          return (
          <div style={{ background: 'var(--ap-bg-card)', borderRadius: 8, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ap-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-text-primary)' }}>Danh sách loài cá ({filteredSpecies.length})</span>
              <input
                type="text"
                placeholder="Tìm theo tên loài cá..."
                value={speciesSearch}
                onChange={e => setSpeciesSearch(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--ap-border)',
                  background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12.5, fontFamily: F, outline: 'none',
                  minWidth: 220
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5, minWidth: 600 }}>
                <thead>
                  <tr style={{ background: 'var(--ap-table-header)', borderBottom: '1px solid var(--ap-border)' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Tên loài</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Nhiệt độ (°C)</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Độ pH</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>TDS (ppm)</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase', width: 100, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpecies.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--ap-border)', transition: 'background 140ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--ap-text-primary)' }}>{s.species_name}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{s.temp_min}°C - {s.temp_max}°C</td>
                      <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{s.ph_min} - {s.ph_max}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{s.tds_min} - {s.tds_max}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openSpeciesModal('edit', s)} title="Sửa" style={{ background: 'none', border: 'none', color: 'var(--ap-primary)', cursor: 'pointer', padding: 3 }}><Edit size={14} /></button>
                          <button onClick={() => openSpeciesModal('delete', s)} title="Xóa" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 3 }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSpecies.length === 0 && !loading && (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có dữ liệu loài cá nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
        })()}

        {/* TAB DEVICES */}
        {activeTab === 'devices' && (() => {
          const filteredDevices = devices.filter(d => {
            const mMatch = deviceSearch.trim() === '' || d.mac_address.toUpperCase().includes(deviceSearch.trim().toUpperCase());
            const vMatch = deviceFilterVersion === 'all' || d.firmware_version === deviceFilterVersion;
            let sMatch = true;
            if (deviceFilterStatus === 'active') sMatch = !!d.tank_id;
            else if (deviceFilterStatus === 'bought') sMatch = !d.tank_id && !!d.is_active;
            else if (deviceFilterStatus === 'inactive') sMatch = !d.tank_id && !d.is_active;
            return mMatch && vMatch && sMatch;
          });
          const totalDevicePages = Math.max(1, Math.ceil(filteredDevices.length / 12));
          const paginatedDevices = filteredDevices.slice(devicePage * 12, (devicePage + 1) * 12);
          
          return (
          <div style={{ background: 'var(--ap-bg-card)', borderRadius: 8, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ap-border)', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-text-primary)' }}>Kho thiết bị ({filteredDevices.length})</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Tìm theo mã MAC..."
                  value={deviceSearch}
                  onChange={e => { setDeviceSearch(e.target.value); setDevicePage(0); setDevicePageInput('1'); }}
                  style={{
                    padding: '5px 10px', borderRadius: 4, border: '1px solid var(--ap-border)',
                    background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12, fontFamily: F, outline: 'none',
                    minWidth: 180
                  }}
                />

                <select
                  value={deviceFilterVersion}
                  onChange={e => { setDeviceFilterVersion(e.target.value); setDevicePage(0); setDevicePageInput('1'); }}
                  style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid var(--ap-border)', background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12, fontFamily: F, outline: 'none' }}
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
                  style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid var(--ap-border)', background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 12, fontFamily: F, outline: 'none' }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang dùng</option>
                  <option value="bought">Đã được mua</option>
                  <option value="inactive">Trong kho</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls Bar */}
            <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid var(--ap-border)', background: 'var(--ap-table-header)', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ap-text-primary)' }}>
                <button
                  onClick={() => {
                    if (devicePage > 0) {
                      setDevicePage(p => p - 1);
                      setDevicePageInput((devicePage).toString());
                    }
                  }}
                  disabled={devicePage === 0}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'transparent', border: '1px solid var(--ap-border)', borderRadius: 4, color: devicePage === 0 ? 'var(--ap-text-muted)' : 'var(--ap-text-primary)', cursor: devicePage === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <ArrowLeft size={12} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                      background: 'var(--ap-bg-card)', border: '1px solid var(--ap-border)', borderRadius: 4,
                      padding: '1px 0', width: 30, textAlign: 'center', fontWeight: 600, color: 'var(--ap-text-primary)', outline: 'none', fontSize: 12
                    }}
                  />
                  <span style={{ color: 'var(--ap-text-muted)' }}>/ {totalDevicePages}</span>
                </div>

                <button
                  onClick={() => {
                    if (devicePage < totalDevicePages - 1) {
                      setDevicePage(p => p + 1);
                      setDevicePageInput((devicePage + 2).toString());
                    }
                  }}
                  disabled={devicePage >= totalDevicePages - 1}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'transparent', border: '1px solid var(--ap-border)', borderRadius: 4, color: devicePage >= totalDevicePages - 1 ? 'var(--ap-text-muted)' : 'var(--ap-text-primary)', cursor: devicePage >= totalDevicePages - 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5, minWidth: 750 }}>
                <thead>
                  <tr style={{ background: 'var(--ap-table-header)', borderBottom: '1px solid var(--ap-border)' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>MAC Address</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Phiên bản</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Trạng thái</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Người sở hữu</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Bể cá</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase', width: 100, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDevices.map(d => {
                    const buyerInfo = macCustomerMap[d.mac_address.trim().toUpperCase()]
                    const isBought = d.is_active || Boolean(buyerInfo)
                    const status = d.tank_id ? 'Đang dùng' : (isBought ? 'Đã được mua' : 'Trong kho')
                    const statusColor = d.tank_id ? '#d97706' : (isBought ? '#0284c7' : '#16a34a')
                    
                    let ownerName = '-'
                    if (d.tanks?.users) {
                      ownerName = `${d.tanks.users.full_name} (${d.tanks.users.phone || 'N/A'})`
                    } else if (buyerInfo) {
                      ownerName = `${buyerInfo.customerName} (${buyerInfo.phone})`
                    }

                    const tankName = d.tanks?.tank_name || '-'

                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--ap-border)', transition: 'background 140ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 20px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--ap-text-primary)' }}>{d.mac_address}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{d.firmware_version}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{ownerName}</span>
                            {buyerInfo && (
                              <button
                                onClick={() => setSelectedBuyerModal(buyerInfo)}
                                title="Xem chi tiết thông tin khách hàng"
                                style={{
                                  padding: '3px 8px', borderRadius: 4,
                                  background: 'var(--ap-hover-bg)', border: '1px solid var(--ap-border)',
                                  color: 'var(--ap-primary)', fontSize: 11.5, fontWeight: 700,
                                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <Eye size={12} /> Xem KH
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{tankName}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-muted)', fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString('vi-VN')}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => openDeviceModal('edit', d)} title="Sửa" style={{ background: 'none', border: 'none', color: 'var(--ap-primary)', cursor: 'pointer', padding: 3 }}><Edit size={14} /></button>
                            <button onClick={() => openDeviceModal('delete', d)} title="Xóa" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 3 }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredDevices.length === 0 && !loading && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có thiết bị nào trong danh sách</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
        })()}

        {/* TAB STAFF */}
        {activeTab === 'staff' && (() => {
          const filteredStaff = staff.filter(s => {
            const query = staffSearch.trim().toLowerCase();
            const matchesSearch = !query ||
              (s.email && String(s.email).toLowerCase().includes(query)) ||
              (s.full_name && String(s.full_name).toLowerCase().includes(query)) ||
              (s.phone && String(s.phone).toLowerCase().includes(query));
            const matchesRole = staffRoleFilter === 'all' || s.role === staffRoleFilter;
            return matchesSearch && matchesRole;
          });

          return (
            <div style={{ background: 'var(--ap-bg-card)', borderRadius: 8, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ap-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-text-primary)' }}>Danh sách nhân viên ({filteredStaff.length}/{staff.length})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ap-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Tìm theo email, tên, SĐT..."
                      value={staffSearch}
                      onChange={e => setStaffSearch(e.target.value)}
                      style={{
                        padding: '6px 12px 6px 30px',
                        borderRadius: 6,
                        border: '1px solid var(--ap-border)',
                        background: 'var(--ap-input-bg)',
                        color: 'var(--ap-text-primary)',
                        fontSize: 13,
                        outline: 'none',
                        width: 220
                      }}
                    />
                  </div>
                  <select
                    value={staffRoleFilter}
                    onChange={e => setStaffRoleFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--ap-border)',
                      background: 'var(--ap-input-bg)',
                      color: 'var(--ap-text-primary)',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Tất cả chức vụ</option>
                    <option value="staff_warehouse">Nhân viên kho</option>
                    <option value="staff_shipper">Nhân viên giao hàng</option>
                    <option value="staff_support">Nhân viên hỗ trợ</option>
                    <option value="staff_maintenance">Nhân viên bảo trì</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5, minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: 'var(--ap-table-header)', borderBottom: '1px solid var(--ap-border)' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Họ và tên</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Số điện thoại</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Chức vụ</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Ngày tạo</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase', width: 100, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--ap-border)', transition: 'background 140ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--ap-text-primary)' }}>{s.full_name}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{s.email}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-secondary)' }}>{s.phone || '-'}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-primary)', fontWeight: 600 }}>
                          {STAFF_ROLE_LABELS[s.role as StaffRole] || 'Staff'}
                        </td>
                        <td style={{ padding: '12px 20px', color: 'var(--ap-text-muted)', fontSize: 12 }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => openStaffModal('edit', s)} title="Sửa" style={{ background: 'none', border: 'none', color: 'var(--ap-primary)', cursor: 'pointer', padding: 3 }}><Edit size={14} /></button>
                            <button onClick={() => openStaffModal('delete', s)} title="Xóa" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 3 }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStaff.length === 0 && !loading && (
                      <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có nhân viên nào phù hợp</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {/* TAB ORDERS */}
        {activeTab === 'orders' && (() => {
          const filteredOrders = orders.filter(o => {
            const query = orderSearch.trim().toLowerCase();
            const matchesSearch = !query ||
              (o.customerName && String(o.customerName).toLowerCase().includes(query)) ||
              (o.phone && String(o.phone).toLowerCase().includes(query)) ||
              (o.id && String(o.id).toLowerCase().includes(query)) ||
              (o.productVersion && String(o.productVersion).toLowerCase().includes(query));
            const matchesStatus = orderFilterStatus === 'all' || o.status === orderFilterStatus;
            return matchesSearch && matchesStatus;
          });

          return (
            <div style={{ background: 'var(--ap-bg-card)', borderRadius: 8, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ap-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ap-text-primary)' }}>Danh sách đơn hàng ({filteredOrders.length}/{orders.length})</span>
                  {pendingOrdersCount > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: 100 }}>
                      {pendingOrdersCount} đơn chờ duyệt
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ap-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Tìm tên, SĐT, mã đơn..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      style={{
                        padding: '6px 12px 6px 30px',
                        borderRadius: 6,
                        border: '1px solid var(--ap-border)',
                        background: 'var(--ap-input-bg)',
                        color: 'var(--ap-text-primary)',
                        fontSize: 13,
                        outline: 'none',
                        width: 220
                      }}
                    />
                  </div>
                  <select
                    value={orderFilterStatus}
                    onChange={e => setOrderFilterStatus(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--ap-border)',
                      background: 'var(--ap-input-bg)',
                      color: 'var(--ap-text-primary)',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="confirmed">Đã duyệt</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5, minWidth: 1050 }}>
                  <thead>
                    <tr style={{ background: 'var(--ap-table-header)', borderBottom: '1px solid var(--ap-border)' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Mã đơn</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Khách hàng</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Sản phẩm</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Tổng tiền</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Thanh toán</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Trạng thái</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase' }}>Ngày đặt</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 12, textTransform: 'uppercase', minWidth: 240, width: 240, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--ap-border)', transition: 'background 140ms' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 14 }}>#{order.id}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--ap-text-primary)', fontSize: 13.5 }}>{order.customerName}</div>
                          <div style={{ fontSize: 12, color: 'var(--ap-text-muted)' }}>{order.phone}</div>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--ap-text-secondary)', fontSize: 13.5 }}>
                          {order.productVersion}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--ap-text-primary)', fontSize: 14 }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--ap-text-secondary)', fontSize: 13 }}>
                          {order.paymentMethod}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {order.status === 'pending'
                            ? <span style={{ color: '#d97706', fontSize: 13, fontWeight: 700 }}>Chờ duyệt</span>
                            : <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 700 }}>Đã duyệt</span>
                          }
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--ap-text-muted)', fontSize: 12.5 }}>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => setDetailsModal({ show: true, order })}
                              style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', color: 'var(--ap-primary)', border: '1px solid var(--ap-border)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}
                            >
                              Chi tiết
                            </button>
                            {order.paymentMethod === 'Chuyển khoản' && (
                              <button
                                onClick={() => setReceiptModal({ show: true, order })}
                                style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', color: 'var(--ap-text-secondary)', border: '1px solid var(--ap-border)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}
                              >
                                Biên lai
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => setApproveModal({ show: true, order })}
                                style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--ap-primary)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}
                              >
                                Duyệt đơn
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && !loading && (
                      <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có đơn hàng nào phù hợp</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {/* TAB SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div style={{ background: 'var(--ap-bg-card)', borderRadius: 8, border: '1px solid var(--ap-border)', overflow: 'hidden', boxShadow: 'var(--ap-shadow)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ap-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ap-text-primary)' }}>Gói cước dịch vụ ({subscriptionPlans.length})</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600, fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--ap-table-header)', borderBottom: '1px solid var(--ap-border)' }}>
                    <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--ap-text-primary)', textTransform: 'uppercase' }}>Tên gói</th>
                    <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--ap-text-primary)', textTransform: 'uppercase' }}>Loại</th>
                    <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--ap-text-primary)', textTransform: 'uppercase' }}>Giá cước</th>
                    <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 700, color: 'var(--ap-text-primary)', textTransform: 'uppercase' }}>Quyền lợi</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionPlans.map((plan, i) => (
                    <tr key={plan.id} style={{ borderBottom: i < subscriptionPlans.length - 1 ? '1px solid var(--ap-border)' : 'none', transition: 'background 140ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--ap-hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', color: 'var(--ap-text-primary)', fontWeight: 600 }}>{plan.name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--ap-text-secondary)' }}>{plan.plan_type}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--ap-primary)', fontWeight: 700 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--ap-text-secondary)', fontSize: 12 }}>
                        Bể tối đa: {plan.max_tanks} • Lưu lịch sử: {plan.history_days} ngày • Setup Thiết bị: {plan.smart_device_setup ? 'Có' : 'Không'}
                      </td>
                    </tr>
                  ))}
                  {subscriptionPlans.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--ap-text-muted)' }}>Chưa có gói cước nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Custom Notification Toast */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        zIndex: 2000,
        background: 'var(--ap-bg-card)',
        border: `1px solid ${notification.type === 'error' ? '#ef4444' : 'var(--ap-primary)'}`,
        color: notification.type === 'error' ? '#ef4444' : 'var(--ap-primary)',
        padding: '10px 20px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        opacity: notification.show ? 1 : 0,
        transform: notification.show ? 'translate(-50%, 0)' : 'translate(-50%, -20px)',
        transition: 'all 240ms ease',
        pointerEvents: notification.show ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: 'var(--ap-shadow)'
      }}>
        {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
        {notification.msg}
      </div>

      {/* Modals & Dialogs */}
      {subModal.show && (
        <Dialog
          title="Thêm gói cước mới"
          error={errorMsg}
          loading={saving}
          confirmText="Lưu"
          confirmColor="var(--ap-primary)"
          onConfirm={saveSubscription}
          onCancel={() => setSubModal({ show: false, mode: 'add' })}
        >
          <Input label="Tên gói cước" value={subForm.name} onChange={(e: any) => setSubForm({ ...subForm, name: e.target.value })} placeholder="VD: Gói Siêu Cấp" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 6 }}>Loại gói</label>
              <select style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--ap-input-border)', background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: F, outline: 'none', transition: 'border-color 160ms' }}
                value={subForm.plan_type} onChange={e => setSubForm({ ...subForm, plan_type: e.target.value as any })}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--ap-input-border)'}
              >
                <option value="free" style={{ color: '#000' }}>Miễn phí</option>
                <option value="premium" style={{ color: '#000' }}>Cao cấp (Premium)</option>
                <option value="enterprise" style={{ color: '#000' }}>Doanh nghiệp</option>
              </select>
            </div>
            <Input label="Giá (VNĐ)" type="number" value={subForm.price} onChange={(e: any) => setSubForm({ ...subForm, price: parseInt(e.target.value, 10) })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Thời hạn (Tháng)" type="number" value={subForm.duration_months} onChange={(e: any) => setSubForm({ ...subForm, duration_months: parseInt(e.target.value, 10) })} />
            <Input label="Số bể tối đa" type="number" value={subForm.max_tanks} onChange={(e: any) => setSubForm({ ...subForm, max_tanks: parseInt(e.target.value, 10) })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Lưu trữ lịch sử (Ngày)" type="number" value={subForm.history_days} onChange={(e: any) => setSubForm({ ...subForm, history_days: parseInt(e.target.value, 10) })} />
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--ap-text-primary)' }}>
              <input type="checkbox" checked={subForm.smart_device_setup} onChange={e => setSubForm({ ...subForm, smart_device_setup: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--ap-primary)' }} />
              Setup Thiết bị
            </label>
          </div>
        </Dialog>
      )}

      {speciesModal.show && (
        <Dialog
          title={speciesModal.mode === 'add' ? 'Thêm loài cá mới' : speciesModal.mode === 'edit' ? 'Sửa loài cá' : 'Xóa loài cá'}
          message={speciesModal.mode === 'delete' ? `Bạn có chắc chắn muốn xóa loài cá "${speciesModal.data?.species_name}"?` : undefined}
          error={errorMsg}
          loading={saving}
          confirmText={speciesModal.mode === 'delete' ? 'Xóa' : 'Lưu'}
          confirmColor={speciesModal.mode === 'delete' ? '#ef4444' : 'var(--ap-primary)'}
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
          loading={saving}
          confirmText={deviceModal.mode === 'delete' ? 'Xóa' : 'Lưu'}
          confirmColor={deviceModal.mode === 'delete' ? '#ef4444' : 'var(--ap-primary)'}
          onConfirm={saveDevice}
          onCancel={() => setDeviceModal({ show: false, mode: 'add' })}
        >
          {deviceModal.mode !== 'delete' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 6 }}>
                  MAC Address {deviceModal.mode === 'add' && '(Cách nhau bằng dấu phẩy hoặc xuống dòng)'}
                </label>
                {deviceModal.mode === 'add' ? (
                  <textarea
                    value={devForm.mac_address}
                    onChange={(e: any) => setDevForm({ ...devForm, mac_address: e.target.value })}
                    placeholder="VD: AA:BB:CC:DD:EE:FF&#10;11:22:33:44:55:66"
                    rows={8}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--ap-input-border)',
                      background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: 'monospace',
                      outline: 'none', transition: 'border-color 160ms', resize: 'vertical', boxSizing: 'border-box'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--ap-input-border)'}
                  />
                ) : (
                  <Input value={devForm.mac_address} onChange={(e: any) => setDevForm({ ...devForm, mac_address: e.target.value })} placeholder="VD: AA:BB:CC:DD:EE:FF" />
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)', marginBottom: 6 }}>Phiên bản</label>
                <select style={{
                  width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid var(--ap-input-border)',
                  background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)', fontSize: 13, fontFamily: F, outline: 'none',
                  transition: 'border-color 160ms'
                }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--ap-primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--ap-input-border)'}
                  value={devForm.firmware_version} onChange={(e) => setDevForm({ ...devForm, firmware_version: e.target.value })}>
                  <option value="V1" style={{ color: '#000' }}>V1</option>
                  <option value="V2" style={{ color: '#000' }}>V2</option>
                  <option value="V3" style={{ color: '#000' }}>V3</option>
                  <option value="V4" style={{ color: '#000' }}>V4</option>
                </select>
              </div>

              {/* Auto price calculation display */}
              <div style={{ padding: 12, borderRadius: 6, background: 'var(--ap-hover-bg)', border: '1px solid var(--ap-border)', marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--ap-text-secondary)' }}>Giá bán dự kiến ({devForm.firmware_version}):</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ap-primary)' }}>{formatPrice(devForm.firmware_version)}</span>
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
          loading={saving}
          confirmText={staffModal.mode === 'delete' ? 'Xóa' : staffModal.mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
          confirmColor={staffModal.mode === 'delete' ? '#ef4444' : 'var(--ap-primary)'}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ap-text-primary)' }}>Phân loại chức vụ</label>
                <select
                  value={staffForm.role}
                  onChange={(e: any) => setStaffForm({ ...staffForm, role: e.target.value as StaffRole })}
                  style={{
                    padding: '9px 12px', borderRadius: 6, fontSize: 13, fontFamily: F,
                    background: 'var(--ap-input-bg)', color: 'var(--ap-text-primary)',
                    border: '1px solid var(--ap-input-border)', outline: 'none', cursor: 'pointer', width: '100%',
                  }}
                >
                  <option value="staff_warehouse">Nhân viên kho (Đóng gói)</option>
                  <option value="staff_shipper">Nhân viên giao hàng & Lắp đặt</option>
                  <option value="staff_support">Nhân viên hỗ trợ khách hàng</option>
                  <option value="staff_maintenance">Nhân viên bảo trì thiết bị</option>
                </select>
              </div>
            </>
          )}
        </Dialog>
      )}

      {/* Approve Order Modal */}
      {approveModal.show && approveModal.order && (
        <Dialog
          title="Duyệt đơn hàng"
          error=""
          loading={saving}
          confirmText="Xác nhận & Giao việc"
          cancelText="Hủy"
          confirmColor="#16a34a"
          onConfirm={async () => {
            if (saving) return
            setSaving(true)
            try {
              const { error: orderError } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', approveModal.order!.id)
              if (orderError) {
                return showNotification(orderError.message, 'error')
              }

              const { error: taskError } = await supabase.from('tasks').insert({
                task_type: 'packing',
                customer_id: approveModal.order!.userId,
                order_id: approveModal.order!.id,
                title: `Đóng gói đơn hàng #${approveModal.order!.id}`,
                description: `Khách hàng: ${approveModal.order!.customerName}\nSĐT: ${approveModal.order!.phone}\nĐịa chỉ: ${approveModal.order!.address}`,
              })

              if (taskError) {
                return showNotification(taskError.message, 'error')
              }

              setOrders(prev => prev.map(o => o.id === approveModal.order!.id ? { ...o, status: 'confirmed' } : o))
              showNotification(`Đã duyệt đơn và tạo việc đóng gói cho Kho!`)
              setApproveModal({ show: false, order: null })
            } finally {
              setSaving(false)
            }
          }}
          onCancel={() => setApproveModal({ show: false, order: null })}
        >
          {/* Order summary */}
          <div style={{ padding: '12px 14px', borderRadius: 6, background: 'var(--ap-table-header)', border: '1px solid var(--ap-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Mã đơn</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--ap-text-primary)' }}>#{approveModal.order.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Khách hàng</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>{approveModal.order.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Sản phẩm</span>
              <span style={{ fontWeight: 600, color: 'var(--ap-text-primary)' }}>{approveModal.order.productVersion}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Tổng tiền</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(approveModal.order.totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Địa chỉ</span>
              <span style={{ fontWeight: 500, color: 'var(--ap-text-secondary)', maxWidth: 200, textAlign: 'right' }}>{approveModal.order.address}</span>
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: 6,
            background: 'var(--ap-hover-bg)', border: '1px solid var(--ap-border)',
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 4
          }}>
            <Truck size={16} color="var(--ap-primary)" />
            <div style={{ fontSize: 12, color: 'var(--ap-text-secondary)', lineHeight: 1.4 }}>
              Đơn hàng sẽ được Kho đóng gói và tạo việc giao hàng & lắp đặt tận nơi.
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
          confirmColor="var(--ap-primary)"
          onConfirm={() => setReceiptModal({ show: false, order: null })}
          onCancel={() => setReceiptModal({ show: false, order: null })}
        >
          <div style={{ padding: 14, background: 'var(--ap-bg-card)', borderRadius: 6, border: '1px solid var(--ap-border)', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--ap-text-primary)' }}>Đã thanh toán chuyển khoản</h4>
            <div style={{ fontSize: 13, color: 'var(--ap-text-secondary)', display: 'grid', gap: 6, textAlign: 'left', background: 'var(--ap-hover-bg)', padding: 12, borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mã giao dịch:</span> <strong style={{ color: 'var(--ap-text-primary)' }}>TXN-{receiptModal.order.id.toString().slice(0, 6)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Khách hàng:</span> <strong style={{ color: 'var(--ap-text-primary)' }}>{receiptModal.order.customerName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Số tiền:</span> <strong style={{ color: 'var(--ap-primary)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(receiptModal.order.totalPrice)}</strong></div>
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
          confirmColor="var(--ap-primary)"
          onConfirm={() => setDetailsModal({ show: false, order: null })}
          onCancel={() => setDetailsModal({ show: false, order: null })}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--ap-text-primary)' }}>#{detailsModal.order.id}</span>
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
                <span style={{ color: 'var(--ap-text-primary)', fontStyle: 'italic', background: 'var(--ap-hover-bg)', padding: '4px 8px', borderRadius: 4 }}>"{detailsModal.order.note}"</span>
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
                <span style={{ color: 'var(--ap-text-muted)' }}>Mã MAC thiết bị:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--ap-primary)' }}>{detailsModal.order.deviceMacs}</span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Tổng tiền:</span>
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 15 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailsModal.order.totalPrice)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--ap-text-muted)' }}>Ngày đặt:</span>
              <span style={{ color: 'var(--ap-text-primary)' }}>{new Date(detailsModal.order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </Dialog>
      )}

      {/* Buyer Customer Info Modal */}
      {selectedBuyerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ width: 440, background: 'var(--ap-bg-card)', border: '1px solid var(--ap-border)', borderRadius: 12, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--ap-border)' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ap-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} style={{ color: 'var(--ap-primary)' }} /> Thông tin khách hàng đã mua
              </h3>
              <button onClick={() => setSelectedBuyerModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ap-text-muted)', padding: 4 }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Tên khách hàng:</span>
                <span style={{ color: 'var(--ap-text-primary)', fontWeight: 700 }}>{selectedBuyerModal.customerName}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Số điện thoại:</span>
                <span style={{ color: 'var(--ap-text-primary)', fontWeight: 700 }}>{selectedBuyerModal.phone}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Email:</span>
                <span style={{ color: 'var(--ap-text-primary)' }}>{selectedBuyerModal.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Địa chỉ giao:</span>
                <span style={{ color: 'var(--ap-text-primary)', flex: 1, lineHeight: 1.4 }}>{selectedBuyerModal.address}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Sản phẩm:</span>
                <span style={{ color: 'var(--ap-primary)', fontWeight: 700 }}>{selectedBuyerModal.productName}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Mã đơn hàng:</span>
                <span style={{ color: 'var(--ap-text-primary)', fontWeight: 700 }}>Đơn #{selectedBuyerModal.orderId}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 120, color: 'var(--ap-text-secondary)', fontWeight: 600 }}>Ngày mua:</span>
                <span style={{ color: 'var(--ap-text-muted)' }}>{new Date(selectedBuyerModal.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button
                onClick={() => setSelectedBuyerModal(null)}
                style={{ padding: '8px 18px', background: 'var(--ap-hover-bg)', border: '1px solid var(--ap-border)', color: 'var(--ap-text-primary)', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
