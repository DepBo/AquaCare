import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Droplets, Thermometer, Wind, Zap, Fish, Bell,
  LogOut, Home, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Pencil, Trash2, Plus, ChevronDown, X, Check
} from 'lucide-react'

const F = "'Inter', sans-serif"

// ── Kiểu dữ liệu ────────────────────────────────────────────
interface SensorReading { time: string; value: number }
interface SensorData {
  ph: SensorReading[]
  tds: SensorReading[]
  temp: SensorReading[]
  do: SensorReading[]
  turbidity: SensorReading[]
  salinity: SensorReading[]
}
interface Pond { id: string; name: string }

// ── Sinh dữ liệu giả ─────────────────────────────────────────
function generateHistory(base: number, range: number, count = 24): SensorReading[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(now - (count - 1 - i) * 3600_000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    value: +(base + (Math.random() - 0.5) * range * 2).toFixed(2),
  }))
}

function initSensor(): SensorData {
  return {
    ph: generateHistory(7.0, 0.3),
    tds: generateHistory(250, 30),
    temp: generateHistory(26.0, 1.0),
    do: generateHistory(6.5, 0.5),
    turbidity: generateHistory(2.0, 1.0),
    salinity: generateHistory(0.1, 0.1),
  }
}

// ── SVG Sparkline ─────────────────────────────────────────────
function Sparkline({ data, color, height = 60, width = 280 }: { data: number[]; color: string; height?: number; width?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 10) - 5
    return `${x},${y}`
  }).join(' ')
  const areaBottom = `${width},${height} 0,${height}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${areaBottom}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = pts.split(' ').pop()!.split(',')
        return <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
      })()}
    </svg>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────
function BarChart({ data, color, labels, height = 120 }: { data: number[]; color: string; labels: string[]; height?: number }) {
  const max = Math.max(...data) || 1
  const barW = 20
  const gap = 8
  const total = data.length * (barW + gap)
  return (
    <svg width="100%" viewBox={`0 0 ${total} ${height + 20}`} style={{ overflow: 'visible' }}>
      {data.map((v, i) => {
        const bh = (v / max) * height
        const x = i * (barW + gap)
        return (
          <g key={i}>
            <rect x={x} y={height - bh} width={barW} height={bh} rx={4}
              fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily={F}>
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Cấu hình cảm biến ─────────────────────────────────────────
const SENSOR_CFG = [
  { key: 'ph' as const, label: 'pH', unit: '', icon: Droplets, color: '#00A896', good: [6.5, 7.5], warn: [6.0, 8.0] },
  { key: 'temp' as const, label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: '#FF8C42', good: [24, 28], warn: [22, 30] },
  { key: 'do' as const, label: 'Oxy hòa tan', unit: 'mg/L', icon: Wind, color: '#4DA6FF', good: [5, 8], warn: [4, 10] },
  { key: 'tds' as const, label: 'TDS', unit: 'ppm', icon: Zap, color: '#C77DFF', good: [150, 300], warn: [100, 400] },
  { key: 'turbidity' as const, label: 'Độ đục', unit: 'NTU', icon: Activity, color: '#FFD166', good: [0, 5], warn: [0, 10] },
  { key: 'salinity' as const, label: 'Độ mặn', unit: 'ppt', icon: Fish, color: '#00A896', good: [0, 0.5], warn: [0, 1.0] },
]

function statusColor(val: number, good: number[], warn: number[]) {
  if (val >= good[0] && val <= good[1]) return '#00A896'
  if (val >= warn[0] && val <= warn[1]) return '#FFB347'
  return '#FF6B6B'
}
function statusLabel(val: number, good: number[], warn: number[]) {
  if (val >= good[0] && val <= good[1]) return 'Tốt'
  if (val >= warn[0] && val <= warn[1]) return 'Cảnh báo'
  return 'Nguy hiểm'
}

const INITIAL_PONDS: Pond[] = [
  { id: 'dev_01', name: 'Hồ Cá Koi Ngoài Sân' },
  { id: 'dev_02', name: 'Bể Thủy Sinh Phòng Khách' },
  { id: 'dev_03', name: 'Bể Ươm Cá Giống' },
]

// ── Custom Dialog ────────────────────────────────────────────
function Dialog({
  title, message, confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmColor = '#00A896', onConfirm, onCancel, children
}: {
  title: string; message?: string; confirmText?: string; cancelText?: string
  confirmColor?: string; onConfirm: () => void; onCancel: () => void; children?: React.ReactNode
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        background: 'linear-gradient(135deg, #0d1a2e, #112240)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 18, padding: '28px 32px', width: 360, maxWidth: '90vw',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'dialogIn 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>
        {message && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{message}</p>
        )}
        {children}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: F,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >{cancelText}</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            transition: 'all 160ms', boxShadow: `0 4px 16px ${confirmColor}40`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

// ── Pond Dropdown ────────────────────────────────────────────
function PondDropdown({
  ponds, activeDevice, onSelect, onRename, onDelete, onAdd
}: {
  ponds: Pond[]; activeDevice: string
  onSelect: (id: string) => void
  onRename: (pond: Pond) => void
  onDelete: (pond: Pond) => void
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activePond = ponds.find(p => p.id === activeDevice)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#00A896', fontSize: 12, fontWeight: 600, fontFamily: F,
        transition: 'all 180ms', minWidth: 180,
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <Fish size={13} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activePond?.name ?? 'Chọn bể cá'}
        </span>
        <ChevronDown size={13} style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
          background: 'linear-gradient(135deg, #0d1a2e, #112240)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)', minWidth: 240,
          animation: 'fadeDown 160ms ease',
          overflow: 'hidden',
        }}>
          {/* Pond list */}
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
              Danh sách bể cá
            </div>
            {ponds.map(pond => (
              <div key={pond.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 9,
                background: pond.id === activeDevice ? 'rgba(0,168,150,0.12)' : 'transparent',
                transition: 'background 150ms',
              }}
                onMouseEnter={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Select area */}
                <button onClick={() => { onSelect(pond.id); setOpen(false) }} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', color: pond.id === activeDevice ? '#00A896' : 'rgba(255,255,255,0.65)',
                  fontSize: 12, fontWeight: pond.id === activeDevice ? 600 : 400, fontFamily: F, textAlign: 'left', padding: 0,
                }}>
                  {pond.id === activeDevice
                    ? <Check size={12} style={{ color: '#00A896', flexShrink: 0 }} />
                    : <div style={{ width: 12, flexShrink: 0 }} />
                  }
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pond.name}</span>
                </button>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); onRename(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'rgba(255,255,255,0.3)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#4DA6FF' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    title="Đổi tên"
                  ><Pencil size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); onDelete(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'rgba(255,255,255,0.3)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)'; e.currentTarget.style.color = '#FF6B6B' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    title="Xóa"
                  ><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

          {/* Add new */}
          <div style={{ padding: '4px 8px 8px' }}>
            <button onClick={() => { onAdd(); setOpen(false) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 9, border: '1px dashed rgba(0,229,160,0.25)',
              background: 'rgba(0,229,160,0.04)', color: '#00A896', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: F, transition: 'all 160ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.10)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.25)' }}
            >
              <Plus size={13} /> Thêm bể mới
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Component chính ───────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const [sensorData, setSensorData] = useState<SensorData>(initSensor)
  const [selectedSensor, setSelectedSensor] = useState<keyof SensorData>('ph')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alerts, setAlerts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'alerts'>('overview')
  const [ponds, setPonds] = useState<Pond[]>(INITIAL_PONDS)
  const [activeDevice, setActiveDevice] = useState(INITIAL_PONDS[0].id)
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [addDialog, setAddDialog] = useState(false)
  const [addName, setAddName] = useState('')
  const [renameDialog, setRenameDialog] = useState<Pond | null>(null)
  const [renameName, setRenameName] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<Pond | null>(null)

  // ── Simulate reload on device switch ─────────────────────────
  const reloadSensor = () => {
    setLoading(true)
    setTimeout(() => {
      setSensorData({
        ph: generateHistory(7.0 + (Math.random() - 0.5) * 0.4, 0.3),
        tds: generateHistory(250 + (Math.random() - 0.5) * 100, 30),
        temp: generateHistory(26.0 + (Math.random() - 0.5) * 3, 1.0),
        do: generateHistory(6.5 + (Math.random() - 0.5) * 1.5, 0.5),
        turbidity: generateHistory(2.0 + (Math.random() - 0.5) * 2, 1.0),
        salinity: generateHistory(0.1 + (Math.random() - 0.5) * 0.1, 0.1),
      })
      setAlerts([])
      setLoading(false)
    }, 150)
  }

  // Đổi thiết bị → làm mới data
  useEffect(() => { reloadSensor() }, [activeDevice])

  // Bảo vệ route
  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  // Cập nhật sensor mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        const append = (arr: SensorReading[], base: number, range: number) =>
          [...arr.slice(-23), { time: now, value: +(base + (Math.random() - 0.5) * range * 2).toFixed(2) }]
        return {
          ph: append(prev.ph, 7.0, 0.3),
          tds: append(prev.tds, 250, 30),
          temp: append(prev.temp, 26.0, 1.0),
          do: append(prev.do, 6.5, 0.5),
          turbidity: append(prev.turbidity, 2.0, 1.0),
          salinity: append(prev.salinity, 0.1, 0.1),
        }
      })
      setTick(t => t + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Tạo cảnh báo
  useEffect(() => {
    const newAlerts: string[] = []
    SENSOR_CFG.forEach(cfg => {
      const latest = sensorData[cfg.key].at(-1)?.value ?? 0
      if (latest < cfg.warn[0] || latest > cfg.warn[1]) {
        newAlerts.push(`⚠️ ${cfg.label} = ${latest}${cfg.unit} — ngoài ngưỡng cho phép!`)
      }
    })
    setAlerts(newAlerts)
  }, [tick])

  const handleLogout = () => {
    localStorage.removeItem('cs_auth')
    navigate('/login')
  }

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleSelectPond = (id: string) => {
    setActiveDevice(id)
  }

  const handleAddConfirm = () => {
    const name = addName.trim()
    if (!name) return
    const newPond: Pond = { id: `dev_${Date.now()}`, name }
    setPonds(prev => [...prev, newPond])
    setActiveDevice(newPond.id)
    setAddName('')
    setAddDialog(false)
  }

  const handleRenameConfirm = () => {
    const name = renameName.trim()
    if (!name || !renameDialog) return
    setPonds(prev => prev.map(p => p.id === renameDialog.id ? { ...p, name } : p))
    setRenameDialog(null)
    setRenameName('')
  }

  const handleDeleteConfirm = () => {
    if (!deleteDialog) return
    const remaining = ponds.filter(p => p.id !== deleteDialog.id)
    setPonds(remaining)
    if (activeDevice === deleteDialog.id) {
      setActiveDevice(remaining[0]?.id ?? '')
    }
    setDeleteDialog(null)
  }

  const latest = Object.fromEntries(
    SENSOR_CFG.map(cfg => [cfg.key, sensorData[cfg.key].at(-1)?.value ?? 0])
  ) as Record<keyof SensorData, number>

  const selectedCfg = SENSOR_CFG.find(c => c.key === selectedSensor)!
  const selectedHistory = sensorData[selectedSensor]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 60%, #0d2235 100%)', fontFamily: F, color: '#fff', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0,
        background: 'rgba(10,20,38,0.95)', borderRight: '1px solid rgba(26,45,74,0.5)',
        backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
          onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1B4F72,#00A896)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,229,160,0.25)' }}>
            <Fish size={18} color="#fff" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>AQUACARE</span>}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'overview', icon: Home, label: 'Tổng quan' },
            { id: 'sensors', icon: Activity, label: 'Cảm biến' },
            { id: 'alerts', icon: Bell, label: `Cảnh báo${alerts.length ? ` (${alerts.length})` : ''}` },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                background: activeTab === item.id ? 'rgba(0,229,160,0.12)' : 'transparent',
                color: activeTab === item.id ? '#00A896' : 'rgba(255,255,255,0.45)',
                transition: 'all 180ms', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Phạm Lê Nhật Minh</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>phamlenhatminh1609@gmail.com</div>
            </div>
          )}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, background: 'transparent', color: 'rgba(255,107,107,0.7)', transition: 'all 180ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#FF6B6B' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,107,107,0.7)' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(26,45,74,0.4)', background: 'rgba(10,20,38,0.7)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {activeTab === 'overview' && '📊 Tổng quan hệ thống'}
              {activeTab === 'sensors' && '📡 Biểu đồ cảm biến'}
              {activeTab === 'alerts' && '🔔 Cảnh báo & Thông báo'}
            </h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Custom Pond Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Bể cá:</span>
              <PondDropdown
                ponds={ponds}
                activeDevice={activeDevice}
                onSelect={handleSelectPond}
                onRename={pond => { setRenameDialog(pond); setRenameName(pond.name) }}
                onDelete={pond => setDeleteDialog(pond)}
                onAdd={() => { setAddName(''); setAddDialog(true) }}
              />
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(0,229,160,0.3)', borderTopColor: '#00A896', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Đang tải...
              </div>
            )}

            {alerts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.2)', fontSize: 11, color: '#FF6B6B' }}>
                <AlertTriangle size={13} /> {alerts.length} cảnh báo
              </div>
            )}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#FFB347' : '#00A896', boxShadow: `0 0 8px ${loading ? '#FFB347' : '#00A896'}`, animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{loading ? 'Sync...' : 'Live'}</span>
            <Link to="/game" style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00A896', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>🐠 Farm Game</Link>
          </div>
        </div>

        <div style={{ padding: '24px 28px', opacity: loading ? 0.5 : 1, transition: 'opacity 300ms' }}>

          {/* ═══ TAB: OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <>
              {/* 6 Sensor Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                {SENSOR_CFG.map(cfg => {
                  const val = latest[cfg.key]
                  const sc = statusColor(val, cfg.good, cfg.warn)
                  const sl = statusLabel(val, cfg.good, cfg.warn)
                  const hist = sensorData[cfg.key].map(d => d.value)
                  const prev = hist.at(-2) ?? val
                  const delta = val - prev
                  return (
                    <div key={cfg.key}
                      onClick={() => { setSelectedSensor(cfg.key); setActiveTab('sensors') }}
                      style={{ padding: '20px', borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: `1px solid ${cfg.color}18`, cursor: 'pointer', transition: 'all 220ms', position: 'relative', overflow: 'hidden' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${cfg.color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${cfg.color}18`; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.color}08 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <cfg.icon size={16} color={cfg.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{cfg.label}</div>
                            <div style={{ fontSize: 9, color: sc, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{sl}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: delta >= 0 ? '#00A896' : '#FF6B6B' }}>
                          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: sc, marginBottom: 12, letterSpacing: '-0.02em' }}>
                        {val}{cfg.unit}
                      </div>
                      <Sparkline data={hist.slice(-16)} color={cfg.color} height={48} width={220} />
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, ((val - cfg.warn[0]) / (cfg.warn[1] - cfg.warn[0])) * 100))}%`, background: sc, borderRadius: 2, transition: 'width 600ms ease' }} />
                        </div>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>{cfg.warn[0]}–{cfg.warn[1]}{cfg.unit}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(26,45,74,0.5)' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Hoạt động 12 giờ qua (pH)</h3>
                  <BarChart
                    data={sensorData.ph.slice(-12).map(d => d.value)}
                    color="#00A896"
                    labels={sensorData.ph.slice(-12).map(d => d.time)}
                  />
                </div>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(26,45,74,0.5)' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Trạng thái tổng hợp</h3>
                  {SENSOR_CFG.map(cfg => {
                    const val = latest[cfg.key]
                    const sc = statusColor(val, cfg.good, cfg.warn)
                    const sl = statusLabel(val, cfg.good, cfg.warn)
                    return (
                      <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <cfg.icon size={13} color={cfg.color} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{val}{cfg.unit}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sl}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB: SENSORS ═══ */}
          {activeTab === 'sensors' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {SENSOR_CFG.map(cfg => (
                  <button key={cfg.key}
                    onClick={() => setSelectedSensor(cfg.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1px solid ${selectedSensor === cfg.key ? cfg.color : 'rgba(255,255,255,0.08)'}`, background: selectedSensor === cfg.key ? `${cfg.color}15` : 'rgba(255,255,255,0.03)', color: selectedSensor === cfg.key ? cfg.color : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'all 180ms' }}
                  >
                    <cfg.icon size={13} />
                    {cfg.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 24, borderRadius: 20, background: 'rgba(15,26,48,0.9)', border: `1px solid ${selectedCfg.color}20`, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <selectedCfg.icon size={18} color={selectedCfg.color} />
                      <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selectedCfg.label}</h2>
                    </div>
                    <div style={{ fontSize: 38, fontWeight: 800, color: selectedCfg.color, letterSpacing: '-0.03em' }}>
                      {latest[selectedSensor]}{selectedCfg.unit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Khoảng an toàn</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: selectedCfg.color }}>{selectedCfg.good[0]}–{selectedCfg.good[1]}{selectedCfg.unit}</div>
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'hidden' }}>
                  <svg width="100%" viewBox={`0 0 800 120`} preserveAspectRatio="none" style={{ height: 140 }}>
                    <defs>
                      <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={selectedCfg.color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={selectedCfg.color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const vals = selectedHistory.map(d => d.value)
                      const min = Math.min(...vals)
                      const max = Math.max(...vals)
                      const range = max - min || 1
                      const pts = vals.map((v, i) => {
                        const x = (i / (vals.length - 1)) * 800
                        const y = 110 - ((v - min) / range) * 100
                        return `${x},${y}`
                      }).join(' ')
                      return (
                        <>
                          <polygon points={`0,120 ${pts} 800,120`} fill="url(#mainGrad)" />
                          <polyline points={pts} fill="none" stroke={selectedCfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {[0.25, 0.5, 0.75].map(f => (
                            <line key={f} x1={0} y1={120 - f * 110} x2={800} y2={120 - f * 110} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="6 4" />
                          ))}
                          {vals.map((_, i) => {
                            if (i % 4 !== 0 && i !== vals.length - 1) return null
                            const x = (i / (vals.length - 1)) * 800
                            return <text key={i} x={x} y={118} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)" fontFamily={F}>{selectedHistory[i].time}</text>
                          })}
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { label: 'Hiện tại', value: `${latest[selectedSensor]}${selectedCfg.unit}` },
                  { label: 'Trung bình', value: `${(selectedHistory.reduce((a, d) => a + d.value, 0) / selectedHistory.length).toFixed(2)}${selectedCfg.unit}` },
                  { label: 'Cao nhất', value: `${Math.max(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                  { label: 'Thấp nhất', value: `${Math.min(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                ].map(s => (
                  <div key={s.label} style={{ padding: '16px', borderRadius: 12, background: 'rgba(15,26,48,0.8)', border: `1px solid ${selectedCfg.color}15`, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: selectedCfg.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ TAB: ALERTS ═══ */}
          {activeTab === 'alerts' && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 14, background: alerts.length ? 'rgba(255,107,107,0.08)' : 'rgba(0,229,160,0.08)', border: `1px solid ${alerts.length ? 'rgba(255,107,107,0.2)' : 'rgba(0,229,160,0.2)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                {alerts.length
                  ? <AlertTriangle size={20} color="#FF6B6B" />
                  : <CheckCircle size={20} color="#00A896" />}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: alerts.length ? '#FF6B6B' : '#00A896' }}>
                    {alerts.length ? `${alerts.length} cảnh báo đang hoạt động` : 'Tất cả thông số trong ngưỡng an toàn'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Cập nhật mỗi 3 giây</div>
                </div>
              </div>

              {alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                  <CheckCircle size={48} style={{ marginBottom: 12, color: '#00A896', opacity: 0.5 }} />
                  <div style={{ fontSize: 14 }}>Không có cảnh báo nào</div>
                </div>
              )}

              {alerts.map((a, i) => (
                <div key={i} style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.15)', marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertTriangle size={14} color="#FF6B6B" style={{ flexShrink: 0 }} />
                  {a}
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Hướng dẫn xử lý</h3>
                {[
                  { icon: '💧', title: 'pH bất thường', desc: 'Sử dụng vôi để tăng pH hoặc thêm axit hữu cơ để giảm.' },
                  { icon: '🌡️', title: 'Nhiệt độ quá cao', desc: 'Tăng lưu lượng nước hoặc che phủ ao tránh ánh nắng.' },
                  { icon: '🫧', title: 'Oxy thấp', desc: 'Tăng cường sục khí, giảm mật độ nuôi.' },
                  { icon: '⚗️', title: 'TDS cao', desc: 'Thay nước một phần để pha loãng khoáng chất.' },
                ].map(t => (
                  <div key={t.title} style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8, display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Dialog: Thêm bể mới ── */}
      {addDialog && (
        <Dialog
          title="➕ Thêm bể cá mới"
          confirmText="Thêm bể"
          onConfirm={handleAddConfirm}
          onCancel={() => setAddDialog(false)}
        >
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên bể cá
            </label>
            <input
              autoFocus
              value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddConfirm()}
              placeholder="VD: Bể Rồng Phòng Ngủ"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Đổi tên ── */}
      {renameDialog && (
        <Dialog
          title="✏️ Đổi tên bể cá"
          confirmText="Lưu tên"
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameDialog(null)}
        >
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên mới
            </label>
            <input
              autoFocus
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRenameConfirm()}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Xác nhận xóa ── */}
      {deleteDialog && (
        <Dialog
          title="🗑️ Xóa bể cá"
          message={`Bạn có chắc muốn xóa "${deleteDialog.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa bể"
          confirmColor="#FF6B6B"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog(null)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dialogIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @media (max-width: 768px) { aside { display: none !important; } }
      `}</style>
    </div>
  )
}
