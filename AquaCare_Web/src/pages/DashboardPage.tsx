import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Droplets, Thermometer, Zap, Fish, Bell, AlertCircle,
  LogOut, Home, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Pencil, Trash2, Plus, ChevronDown, X, Check, Sliders, Lightbulb, Power, ArrowLeft,
  Sun, Moon
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, Sector, BarChart, Bar } from 'recharts'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

// ── Kiểu dữ liệu ────────────────────────────────────────────
interface SensorReading { time: string; value: number }
interface SensorData {
  ph: SensorReading[]
  tds: SensorReading[]
  temp: SensorReading[]
  waterLevel: SensorReading[]
}
interface AlertItem {
  key: string; label: string; val: number; unit: string;
  level: 'warn' | 'danger'; msg: string;
}
interface Pond {
  id: number
  name: string
  volume?: number
  species_id?: number
  species_name?: string
  mac_address?: string
}
interface FishSpecies {
  id: number
  species_name: string
}

// ── Sinh dữ liệu giả ─────────────────────────────────────────
const emptySensor = (): SensorData => ({ ph: [], tds: [], temp: [], waterLevel: [] })

// ── Sparkline ─────────────────────────────────────────────
function Sparkline({ data, color, height = 60 }: { data: any[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  return (
    <div style={{ height, width: '100%', marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            fontSize={12}
            tick={{ fill: 'var(--text-primary)' }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            fontSize={12}
            tick={{ fill: 'var(--text-primary)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: color, fontWeight: 700, fontSize: 16 }}
            labelStyle={{ color: 'var(--text-secondary)', marginBottom: 6, fontSize: 13 }}
          />
          <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color-${color.replace('#', '')})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}



// ── Cấu hình cảm biến ─────────────────────────────────────────
const SENSOR_CFG = [
  { key: 'ph' as const, label: 'pH', unit: '', icon: Activity, color: '#00A896', good: [6.5, 7.5], warn: [6.0, 8.0] },
  { key: 'temp' as const, label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: '#FF8C42', good: [24, 28], warn: [22, 30] },
  { key: 'tds' as const, label: 'TDS', unit: 'ppm', icon: Zap, color: '#C77DFF', good: [150, 300], warn: [100, 400] },
  { key: 'waterLevel' as const, label: 'Mực nước', unit: '', icon: Droplets, color: '#4DA6FF', good: [1, 1], warn: [0, 1] },
]

function statusColor(val: number, good: number[], warn: number[], key?: string) {
  if (key === 'waterLevel') return val === 1 ? '#00A896' : '#FF6B6B'
  if (val >= good[0] && val <= good[1]) return '#00A896'
  if (val >= warn[0] && val <= warn[1]) return '#FFB347'
  return '#FF6B6B'
}
function statusLabel(val: number, good: number[], warn: number[], key?: string) {
  if (key === 'waterLevel') return val === 1 ? 'Ổn định' : 'Cạn nước'
  if (val >= good[0] && val <= good[1]) return 'Tốt'
  if (val >= warn[0] && val <= warn[1]) return 'Cảnh báo'
  return 'Nguy hiểm'
}

// ── Custom Dialog ────────────────────────────────────────────
function Dialog({
  title, message, error, confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmColor = '#00A896', onConfirm, onCancel, children
}: {
  title: React.ReactNode | string; message?: string; error?: string; confirmText?: string; cancelText?: string
  confirmColor?: string; onConfirm: () => void; onCancel: () => void; children?: React.ReactNode
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--bg-dialog)',
        border: '1px solid var(--border-color)',
        borderRadius: 18, padding: '28px 32px', width: 360, maxWidth: '90vw',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'dialogIn 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>
        {message && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
        )}
        {children}
        {error && (
          <p style={{ margin: '16px 0 0', fontSize: 13, color: '#FF6B6B', fontWeight: 500, textAlign: 'center' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: error ? 16 : 24 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border-color)',
            background: 'var(--bg-btn-cancel)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: F,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-btn-cancel-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-btn-cancel)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >{cancelText}</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: confirmColor, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
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
  ponds, activeDevice, onSelect, onEdit, onDelete, onAdd
}: {
  ponds: Pond[]; activeDevice: number | null
  onSelect: (id: number) => void
  onEdit: (pond: Pond) => void
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
        background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
        color: '#00A896', fontSize: 12, fontWeight: 600, fontFamily: F,
        transition: 'all 180ms', minWidth: 180,
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-btn-cancel-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-btn-cancel)'}
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
          border: '1px solid var(--border-color)', borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)', minWidth: 240,
          animation: 'fadeDown 160ms ease',
          overflow: 'hidden',
        }}>
          {/* Pond list */}
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
              Danh sách bể cá
            </div>
            {ponds.map(pond => (
              <div key={pond.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 9,
                background: pond.id === activeDevice ? 'rgba(0,168,150,0.12)' : 'transparent',
                transition: 'background 150ms',
              }}
                onMouseEnter={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'var(--bg-btn-cancel)' }}
                onMouseLeave={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Select area */}
                <button onClick={() => { onSelect(pond.id); setOpen(false) }} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', color: pond.id === activeDevice ? '#00A896' : 'var(--text-secondary)',
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
                  <button onClick={e => { e.stopPropagation(); onEdit(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'var(--text-muted)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#4DA6FF' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    title="Cấu hình"
                  ><Pencil size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); onDelete(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'var(--text-muted)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)'; e.currentTarget.style.color = '#FF6B6B' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    title="Xóa"
                  ><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--bg-btn-cancel)', margin: '4px 0' }} />

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
  const [sensorData, setSensorData] = useState<SensorData>(emptySensor())
  const [selectedSensor, setSelectedSensor] = useState<keyof SensorData>('ph')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [alertStats, setAlertStats] = useState<{ name: string, value: number }[]>([])
  const [historyCursors, setHistoryCursors] = useState<number[]>([0])
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0)
  const [historyHasNext, setHistoryHasNext] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const currentHistoryPageRef = useRef(0)

  const [activePieIndex, setActivePieIndex] = useState(0)
  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index)
  }

  useEffect(() => {
    currentHistoryPageRef.current = currentHistoryPage
  }, [currentHistoryPage])

  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'sensors' | 'alerts'>('overview')
  const [pumpState, setPumpState] = useState(false)
  const [lightState, setLightState] = useState(false)
  const [pumpOnTime, setPumpOnTime] = useState('')
  const [pumpOffTime, setPumpOffTime] = useState('')
  const [lightOnTime, setLightOnTime] = useState('')
  const [lightOffTime, setLightOffTime] = useState('')
  const [ponds, setPonds] = useState<Pond[]>([])
  const [fishSpecies, setFishSpecies] = useState<FishSpecies[]>([])
  const [activeDevice, setActiveDevice] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark')
  const [hourlySensorData, setHourlySensorData] = useState<SensorData>(emptySensor())
  const [hourlyActiveTab, setHourlyActiveTab] = useState<keyof SensorData>('ph')
  const [notification, setNotification] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' })

  const showNotification = (msg: string) => {
    setNotification({ show: true, msg })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dashboard_theme', theme)
  }, [theme])

  // Dialog states
  const [addDialog, setAddDialog] = useState(false)
  const [addName, setAddName] = useState('')
  const [addVolume, setAddVolume] = useState<number | string>('')
  const [addSpeciesId, setAddSpeciesId] = useState<number>(0)
  const [addMacAddress, setAddMacAddress] = useState('')
  const [editDialog, setEditDialog] = useState<Pond | null>(null)
  const [editName, setEditName] = useState('')
  const [editVolume, setEditVolume] = useState<number | string>('')
  const [editSpeciesId, setEditSpeciesId] = useState<number>(0)
  const [editMacAddress, setEditMacAddress] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<Pond | null>(null)
  const [dialogError, setDialogError] = useState('')

  // Bảo vệ route
  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  // ── Load Initial Data ─────────────────────────
  useEffect(() => {
    supabase.from('fish_species').select('*').then(({ data }) => {
      if (data) setFishSpecies(data as FishSpecies[])
    })

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
    if (userInfo?.id) {
      supabase.from('tanks').select('*, fish_species(*), devices(mac_address)').eq('user_id', userInfo.id).then(({ data }) => {
        if (data) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            name: t.tank_name,
            volume: t.water_volume_liter,
            species_id: t.species_id,
            species_name: t.fish_species?.species_name,
            mac_address: t.devices?.[0]?.mac_address || ''
          }))
          setPonds(mapped)
          if (mapped.length > 0) setActiveDevice(mapped[0].id)
        }
      })
    }
  }, [])

  // ── Fetch Sensor Data ─────────────────────────
  const fetchSensorData = async () => {
    if (!activeDevice) return
    // setLoading(true)

    const { data: devices } = await supabase.from('devices').select('id').eq('tank_id', activeDevice)
    if (!devices || devices.length === 0) {
      setSensorData(emptySensor())
      setAlerts([])
      // setLoading(false)
      return
    }

    const { data: telemetries } = await supabase.from('telemetry_logs')
      .select('*')
      .eq('device_id', devices[0].id)
      .order('recorded_at', { ascending: false })
      .limit(24)

    if (telemetries) {
      const rev = telemetries.reverse()
      const mapData = (parseFn: (d: any) => number) => rev.map(d => ({
        time: new Date(d.recorded_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        value: parseFn(d)
      }))

      setSensorData({
        ph: mapData(d => Number(d.ph) || 0),
        tds: mapData(d => Number(d.tds) || 0),
        temp: mapData(d => Number(d.temp) || 0),
        waterLevel: mapData(d => d.water_level_ok ? 1 : 0),
      })
    }
    setTick(t => t + 1)
    setLoading(false)
    fetchHourlyData()
  }

  const fetchHourlyData = async () => {
    if (!activeDevice) return
    const { data: devices } = await supabase.from('devices').select('id').eq('tank_id', activeDevice)
    if (!devices || devices.length === 0) return

    const deviceId = devices[0].id
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('telemetry_logs')
      .select('ph, tds, temp, water_level_ok, recorded_at')
      .eq('device_id', deviceId)
      .gte('recorded_at', twelveHoursAgo)
      .order('recorded_at', { ascending: true })

    const buckets: Record<string, {
      phSum: number, phCount: number,
      tdsSum: number, tdsCount: number,
      tempSum: number, tempCount: number,
      waterSum: number, waterCount: number
    }> = {}
    const now = new Date()

    // Create 12 buckets for the last 12 hours
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(/:.*/, ':00')
      buckets[hourStr] = { phSum: 0, phCount: 0, tdsSum: 0, tdsCount: 0, tempSum: 0, tempCount: 0, waterSum: 0, waterCount: 0 }
    }

    if (data) {
      data.forEach(t => {
        const d = new Date(t.recorded_at)
        const hourStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(/:.*/, ':00')
        if (buckets[hourStr]) {
          buckets[hourStr].phSum += Number(t.ph) || 0
          buckets[hourStr].phCount += 1
          buckets[hourStr].tdsSum += Number(t.tds) || 0
          buckets[hourStr].tdsCount += 1
          buckets[hourStr].tempSum += Number(t.temp) || 0
          buckets[hourStr].tempCount += 1
          buckets[hourStr].waterSum += t.water_level_ok ? 1 : 0
          buckets[hourStr].waterCount += 1
        }
      })
    }

    const mapMetric = (sumKey: string, countKey: string) => {
      return Object.keys(buckets).map(time => {
        const b = buckets[time] as any
        return {
          time,
          value: b[countKey] > 0 ? Number((b[sumKey] / b[countKey]).toFixed(2)) : 0
        }
      })
    }

    setHourlySensorData({
      ph: mapMetric('phSum', 'phCount'),
      tds: mapMetric('tdsSum', 'tdsCount'),
      temp: mapMetric('tempSum', 'tempCount'),
      waterLevel: mapMetric('waterSum', 'waterCount'),
    })
  }

  const fetchAlertHistoryPage = async (pageIndex: number, deviceId: number, cursors: number[]) => {
    setHistoryLoading(true);
    const cursor = cursors[pageIndex];
    let query = supabase.from('alerts_history')
      .select('*')
      .eq('tank_id', deviceId)
      .order('id', { ascending: false })
      .limit(11);

    if (cursor > 0) {
      query = query.lt('id', cursor);
    }

    const { data } = await query;
    if (data) {
      const hasNext = data.length > 10;
      const items = data.slice(0, 10);
      setAlertHistory(items);
      setHistoryHasNext(hasNext);

      if (hasNext && cursors.length === pageIndex + 1) {
        setHistoryCursors(prev => [...prev, items[items.length - 1].id]);
      }
      setCurrentHistoryPage(pageIndex);
    }
    setHistoryLoading(false);
  }

  // Đổi thiết bị → làm mới data & Thiết lập Realtime
  useEffect(() => {
    if (!activeDevice) return

    let channel: any;

    const setupRealtime = async () => {
      // 1. Load 24 điểm dữ liệu lịch sử ban đầu
      await fetchSensorData();

      // 2. Lấy device_id tương ứng với bể cá
      const { data: devices } = await supabase.from('devices').select('id, relay_pump_state, relay_light_state, pump_on_time, pump_off_time, light_on_time, light_off_time').eq('tank_id', activeDevice);
      if (!devices || devices.length === 0) return;
      const deviceId = devices[0].id;
      setPumpState(Boolean(devices[0].relay_pump_state));
      setLightState(Boolean(devices[0].relay_light_state));
      setPumpOnTime(devices[0].pump_on_time || '');
      setPumpOffTime(devices[0].pump_off_time || '');
      setLightOnTime(devices[0].light_on_time || '');
      setLightOffTime(devices[0].light_off_time || '');

      // Lấy tất cả loại cảnh báo để thống kê
      const { data: statsData } = await supabase.from('alerts_history').select('alert_type').eq('tank_id', activeDevice)
      if (statsData) {
        const counts = statsData.reduce((acc, h) => {
          acc[h.alert_type] = (acc[h.alert_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setAlertStats(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }

      setHistoryCursors([0])
      setCurrentHistoryPage(0)
      await fetchAlertHistoryPage(0, activeDevice, [0])

      // 3. Đăng ký Realtime
      channel = supabase.channel(`telemetry_logs_device_${deviceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'telemetry_logs',
            filter: `device_id=eq.${deviceId}`
          },
          (payload) => {
            const newData = payload.new as any;
            const timeStr = new Date(newData.recorded_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            setSensorData(prev => {
              const appendData = (arr: SensorReading[], val: number) => [...arr, { time: timeStr, value: val }].slice(-24);
              return {
                ph: appendData(prev.ph, Number(newData.ph) || 0),
                tds: appendData(prev.tds, Number(newData.tds) || 0),
                temp: appendData(prev.temp, Number(newData.temp) || 0),
                waterLevel: appendData(prev.waterLevel, newData.water_level_ok ? 1 : 0),
              };
            });
            setTick(t => t + 1); // Trigger check cảnh báo
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts_history',
            filter: `tank_id=eq.${activeDevice}`
          },
          (payload) => {
            const newAlert = payload.new as any;
            setAlertStats(prev => {
              const existing = prev.find(p => p.name === newAlert.alert_type);
              if (existing) {
                return prev.map(p => p.name === newAlert.alert_type ? { ...p, value: p.value + 1 } : p);
              } else {
                return [...prev, { name: newAlert.alert_type, value: 1 }];
              }
            });
            if (currentHistoryPageRef.current === 0) {
              setAlertHistory(prev => {
                const updated = [newAlert, ...prev];
                if (updated.length > 10) setHistoryHasNext(true);
                return updated.slice(0, 10);
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'devices',
            filter: `id=eq.${deviceId}`
          },
          (payload) => {
            const newData = payload.new as any;
            // Cập nhật lại các State của nút bấm và cấu hình giờ
            setPumpState(Boolean(newData.relay_pump_state));
            setLightState(Boolean(newData.relay_light_state));
            setPumpOnTime(newData.pump_on_time || '');
            setPumpOffTime(newData.pump_off_time || '');
            setLightOnTime(newData.light_on_time || '');
            setLightOffTime(newData.light_off_time || '');
          }
        )
        .subscribe();
    }

    setupRealtime();

    // 4. Dọn dẹp (Cleanup) khi đổi bể khác hoặc unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    }
  }, [activeDevice])

  // Tạo cảnh báo
  useEffect(() => {
    if (!sensorData.ph.length) return
    const newAlerts: AlertItem[] = []
    SENSOR_CFG.forEach(cfg => {
      const latest = sensorData[cfg.key].at(-1)?.value ?? 0
      if (cfg.key === 'waterLevel') {
        if (latest === 0) newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `Mực nước bể cá đang ở mức thấp, vui lòng châm thêm nước!`, level: 'danger' })
      } else {
        if (latest < cfg.warn[0] || latest > cfg.warn[1]) {
          newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `${cfg.label} = ${latest}${cfg.unit} — ngoài ngưỡng cho phép!`, level: 'danger' })
        } else if (latest < cfg.good[0] || latest > cfg.good[1]) {
          newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `${cfg.label} = ${latest}${cfg.unit} — chạm mức cảnh báo sớm!`, level: 'warn' })
        }
      }
    })
    setAlerts(newAlerts)
  }, [tick])

  const handleLogout = () => {
    localStorage.removeItem('cs_auth')
    navigate('/login')
  }

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleSelectPond = (id: number) => {
    setActiveDevice(id)
  }

  const handleAddConfirm = async () => {
    setDialogError('')
    const name = addName.trim()
    if (!name) return

    const mac = addMacAddress.trim()
    if (mac) {
      const { data: dev } = await supabase.from('devices').select('id, tank_id').eq('mac_address', mac).single()
      if (!dev) return setDialogError('Mã thiết bị không tồn tại trên hệ thống!')
      if (dev.tank_id) return setDialogError('Thiết bị này đã được sử dụng cho bể khác!')
    }

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')

    const { data } = await supabase.from('tanks').insert({
      user_id: userInfo.id,
      tank_name: name,
      water_volume_liter: Number(addVolume) || null,
      species_id: addSpeciesId || null
    }).select('*, fish_species(*)')

    if (data && data.length > 0) {
      if (mac) await supabase.from('devices').update({ tank_id: data[0].id }).eq('mac_address', mac)

      const t = data[0]
      const newPond: Pond = {
        id: t.id,
        name: t.tank_name,
        volume: t.water_volume_liter,
        species_id: t.species_id,
        species_name: t.fish_species?.species_name,
        mac_address: mac
      }
      setPonds(prev => [...prev, newPond])
      setActiveDevice(newPond.id)
    }

    setAddName('')
    setAddVolume('')
    setAddSpeciesId(0)
    setAddMacAddress('')
    setAddDialog(false)
  }

  const handleEditConfirm = async () => {
    setDialogError('')
    const name = editName.trim()
    if (!name || !editDialog) return

    const mac = editMacAddress.trim()
    if (mac && mac !== editDialog?.mac_address) {
      const { data: dev } = await supabase.from('devices').select('id, tank_id').eq('mac_address', mac).single()
      if (!dev) return setDialogError('Mã thiết bị không tồn tại trên hệ thống!')
      if (dev.tank_id && dev.tank_id !== editDialog?.id) return setDialogError('Thiết bị này đã thuộc về bể khác!')
    }

    const { data } = await supabase.from('tanks').update({
      tank_name: name,
      water_volume_liter: Number(editVolume) || null,
      species_id: editSpeciesId || null
    }).eq('id', editDialog.id).select('*, fish_species(*)')

    if (data && data.length > 0) {
      if (mac !== editDialog?.mac_address) {
        if (editDialog?.mac_address) await supabase.from('devices').update({ tank_id: null }).eq('mac_address', editDialog.mac_address)
        if (mac) await supabase.from('devices').update({ tank_id: editDialog.id }).eq('mac_address', mac)
      }

      const updatedPond = {
        id: data[0].id,
        name: data[0].tank_name,
        volume: data[0].water_volume_liter,
        species_id: data[0].species_id,
        species_name: data[0].fish_species?.species_name,
        mac_address: mac
      }
      setPonds(prev => prev.map(p => p.id === editDialog.id ? updatedPond : p))
    }
    setEditDialog(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return
    await supabase.from('tanks').delete().eq('id', deleteDialog.id)
    const remaining = ponds.filter(p => p.id !== deleteDialog.id)
    setPonds(remaining)
    if (activeDevice === deleteDialog.id) {
      setActiveDevice(remaining[0]?.id ?? null)
    }
    setDeleteDialog(null)
  }

  const latest = Object.fromEntries(
    SENSOR_CFG.map(cfg => [cfg.key, sensorData[cfg.key].at(-1)?.value ?? 0])
  ) as Record<keyof SensorData, number>

  const selectedCfg = SENSOR_CFG.find(c => c.key === selectedSensor)!
  const selectedHistory = sensorData[selectedSensor]

  const hasDanger = alerts.some(a => a.level === 'danger')
  const alertGlobalColor = alerts.length === 0 ? '#00A896' : (hasDanger ? '#FF6B6B' : '#FFB347')
  const alertGlobalBg = alerts.length === 0 ? 'rgba(0,229,160,0.1)' : (hasDanger ? 'rgba(255,107,107,0.12)' : 'rgba(255,179,71,0.12)')

  const activePond = ponds.find(p => p.id === activeDevice)

  const PIE_COLORS = ['#00A896', '#FF8C42', '#C77DFF', '#4DA6FF', '#FF6B6B'];
  const alertDistData = alertStats;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 4} dy={0} textAnchor="middle" fill={theme === 'dark' ? "rgba(255,255,255,0.6)" : "#000"} fontSize={11} fontWeight={600} fontFamily={F} style={{ textTransform: 'uppercase' }} letterSpacing="0.05em">
          {payload.name}
        </text>
        <text x={cx} y={cy + 18} dy={0} textAnchor="middle" fill={fill} fontSize={22} fontWeight={800} fontFamily={F}>
          {value}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: `drop-shadow(0px 8px 16px ${fill}80)` }}
          cornerRadius={4}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
          cornerRadius={2}
        />
      </g>
    );
  };

  const PowerStyles = `
    :root, [data-theme='dark'] {
      --btn-power-bg: rgba(255,255,255,0.08);
      --btn-power-active: rgba(255,255,255,0.2);
    }
    [data-theme='light'] {
      --btn-power-bg: rgba(0,0,0,0.05);
      --btn-power-active: rgba(0,0,0,0.15);
    }
  `;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: F, color: 'var(--text-primary)', display: 'flex' }}>
      <style>{PowerStyles}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0,
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
          onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1B4F72,#00A896)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,229,160,0.25)' }}>
            <Fish size={18} color="var(--text-primary)" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>AQUACARE</span>}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'overview', icon: Home, label: 'Tổng quan' },
            { id: 'sensors', icon: Activity, label: 'Cảm biến' },
            { id: 'control', icon: Sliders, label: 'Điều khiển thiết bị' },
            { id: 'alerts', icon: Bell, label: `Cảnh báo${alerts.length ? ` (${alerts.length})` : ''}` },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                background: activeTab === item.id ? 'rgba(0,229,160,0.12)' : 'transparent',
                color: activeTab === item.id ? '#00A896' : (theme === 'dark' ? 'var(--text-nav)' : '#000'),
                transition: 'all 180ms', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'var(--bg-nav-hover)' }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Phạm Lê Nhật Minh</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>phamlenhatminh1609@gmail.com</div>
            </div>
          )}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
            textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
            transition: 'all 180ms', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
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

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-topbar)', backdropFilter: 'blur(8px)', flexShrink: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'overview' && <><Home size={20} color="#00A896" /> Tổng quan hệ thống</>}
              {activeTab === 'control' && <><Sliders size={20} color="#00A896" /> Điều khiển thiết bị</>}
              {activeTab === 'sensors' && <><Activity size={20} color="#00A896" /> Biểu đồ cảm biến</>}
              {activeTab === 'alerts' && <><Bell size={20} color="#00A896" /> Cảnh báo & Thông báo</>}
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Custom Pond Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bể cá:</span>
              <PondDropdown
                ponds={ponds}
                activeDevice={activeDevice}
                onSelect={handleSelectPond}
                onEdit={pond => {
                  setEditDialog(pond);
                  setEditName(pond.name);
                  setEditVolume(pond.volume ?? '');
                  setEditSpeciesId(pond.species_id ?? 0);
                  setEditMacAddress(pond.mac_address || '');
                  setDialogError('');
                }}
                onDelete={pond => setDeleteDialog(pond)}
                onAdd={() => { setAddName(''); setAddVolume(''); setAddSpeciesId(0); setAddMacAddress(''); setDialogError(''); setAddDialog(true) }}
              />
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(0,229,160,0.3)', borderTopColor: '#00A896', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Đang tải...
              </div>
            )}

            {alerts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: alertGlobalBg, border: `1px solid ${alertGlobalColor}40`, fontSize: 11, color: alertGlobalColor }}>
                <AlertTriangle size={13} /> {alerts.length} cảnh báo
              </div>
            )}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#FFB347' : '#00A896', boxShadow: `0 0 8px ${loading ? '#FFB347' : '#00A896'}`, animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{loading ? 'Sync...' : 'Live'}</span>
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border-color)',
                background: 'var(--bg-card)', cursor: 'pointer', transition: 'all 200ms',
                color: theme === 'dark' ? '#FFB347' : '#4DA6FF',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-nav-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ padding: '24px 28px', opacity: loading ? 0.5 : 1, transition: 'opacity 300ms', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>

          {/* ═══ TAB: OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Sensor Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                {SENSOR_CFG.map(cfg => {
                  const val = latest[cfg.key]
                  const sc = statusColor(val, cfg.good, cfg.warn, cfg.key)
                  const sl = statusLabel(val, cfg.good, cfg.warn, cfg.key)
                  const histData = sensorData[cfg.key]
                  const hist = histData.map(d => d.value)
                  const prev = hist.at(-2) ?? val
                  const delta = val - prev
                  return (
                    <div key={cfg.key}
                      onClick={() => { setSelectedSensor(cfg.key); setActiveTab('sensors') }}
                      style={{ padding: '20px', borderRadius: 16, background: 'var(--bg-card)', border: `1px solid ${cfg.color}18`, cursor: 'pointer', transition: 'all 220ms', position: 'relative', overflow: 'hidden' }}
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
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{cfg.label}</div>
                            <div style={{ fontSize: 9, color: sc, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{sl}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: delta >= 0 ? '#00A896' : '#FF6B6B' }}>
                          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: sc, marginBottom: 12, letterSpacing: '-0.02em' }}>
                        {cfg.key === 'waterLevel' ? '' : `${val}${cfg.unit}`}
                      </div>
                      {cfg.key === 'waterLevel' ? (
                        <div style={{ marginTop: 16, height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Droplets size={28} color={sc} />
                          <span style={{ fontSize: 16, fontWeight: 600, color: sc, letterSpacing: '0.02em' }}>
                            {val === 1 ? 'Mực nước Ổn định' : 'Cảnh báo Cạn nước'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Sparkline data={sensorData[cfg.key]} color={cfg.color} height={75} />
                          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bg-btn-cancel)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, ((val - cfg.warn[0]) / (cfg.warn[1] - cfg.warn[0])) * 100))}%`, background: sc, borderRadius: 2, transition: 'width 600ms ease' }} />
                            </div>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{cfg.warn[0]}–{cfg.warn[1]}{cfg.unit}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Hoạt động 12 giờ qua</h3>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {SENSOR_CFG.map(cfg => (
                        <button key={cfg.key} onClick={() => setHourlyActiveTab(cfg.key)} style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: F, border: 'none', cursor: 'pointer', transition: 'all 150ms',
                          background: hourlyActiveTab === cfg.key ? `${cfg.color}20` : 'transparent',
                          color: hourlyActiveTab === cfg.key ? cfg.color : 'var(--text-muted)'
                        }}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: 160, width: '100%', marginTop: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hourlySensorData[hourlyActiveTab].length > 0 ? hourlySensorData[hourlyActiveTab] : Array.from({length: 12}).map((_, i) => ({ time: '00:00', value: 0 }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="time"
                          fontSize={10}
                          tick={{ fill: 'var(--text-secondary)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={25}
                          tickFormatter={(val) => val.toFixed(1)}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [`${value}${SENSOR_CFG.find(c => c.key === hourlyActiveTab)?.unit}`, SENSOR_CFG.find(c => c.key === hourlyActiveTab)?.label]}
                          labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                          itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                        />
                        <Bar
                          dataKey="value"
                          fill={SENSOR_CFG.find(c => c.key === hourlyActiveTab)?.color || '#00A896'}
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Trạng thái tổng hợp</h3>
                  {SENSOR_CFG.map(cfg => {
                    const val = latest[cfg.key]
                    const sc = statusColor(val, cfg.good, cfg.warn, cfg.key)
                    const sl = statusLabel(val, cfg.good, cfg.warn, cfg.key)
                    return (
                      <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <cfg.icon size={13} color={cfg.color} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{val}{cfg.unit}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sl}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB: CONTROL ═══ */}
          {activeTab === 'control' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

              {/* Máy bơm nước */}
              <div style={{
                padding: 24, borderRadius: 16, background: 'var(--bg-card)',
                border: `1px solid ${pumpState ? '#00A896' : 'rgba(26,45,74,0.5)'}`,
                transition: 'all 200ms', display: 'flex', flexDirection: 'column', gap: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: pumpState ? 'rgba(0,168,150,0.15)' : 'var(--bg-btn-cancel)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms'
                    }}>
                      <Droplets size={24} color={pumpState ? '#00A896' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>Máy bơm nước</h3>
                      <p style={{ fontSize: 13, margin: 0, color: pumpState ? '#00A896' : 'var(--text-muted)', transition: 'color 200ms' }}>
                        {pumpState ? 'Đang hoạt động' : 'Đang tắt'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newState = !pumpState;
                      const { data: dev, error } = await supabase.from('devices')
                        .update({ relay_pump_state: newState })
                        .eq('tank_id', activeDevice)
                        .select('id')
                        .single();
                      if (!error && dev) {
                        setPumpState(newState);
                        await supabase.from('relay_logs').insert({
                          device_id: dev.id,
                          relay_name: 'Pump',
                          action: newState ? 'ON' : 'OFF',
                          triggered_by: 'USER'
                        });
                      }
                    }}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer',
                      background: pumpState ? '#00A896' : 'var(--btn-power-bg)',
                      boxShadow: pumpState ? '0 0 20px rgba(0,168,150,0.4)' : 'none',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms', flexShrink: 0
                    }}
                  >
                    <Power size={24} color={pumpState ? '#fff' : 'var(--text-secondary)'} />
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  {(pumpOnTime || pumpOffTime) && (
                    <div style={{
                      background: 'var(--bg-btn-cancel)', border: '1px dashed #00A896', borderRadius: 12, padding: '12px 16px', marginBottom: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Lịch tự động: 
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {pumpOnTime && `Bật ${pumpOnTime}`}
                          {pumpOnTime && pumpOffTime && ' - '}
                          {pumpOffTime && `Tắt ${pumpOffTime}`}
                        </span>
                      </div>
                      <button onClick={async () => {
                        const { error } = await supabase.from('devices').update({ pump_on_time: null, pump_off_time: null }).eq('tank_id', activeDevice);
                        if (!error) {
                          setPumpOnTime('');
                          setPumpOffTime('');
                          showNotification('Đã hủy lịch hẹn Máy bơm');
                        }
                      }} style={{
                        background: 'transparent', border: 'none', color: '#FF6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0
                      }}
                      >Hủy lịch</button>
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ bật</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {['07:00', '09:00', '12:00'].map(t => (
                        <button key={t} onClick={() => setPumpOnTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${pumpOnTime === t ? '#00A896' : 'var(--border-color)'}`,
                          background: pumpOnTime === t ? 'rgba(0,168,150,0.15)' : 'var(--bg-btn-cancel)',
                          color: pumpOnTime === t ? '#00A896' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={pumpOnTime} onChange={e => setPumpOnTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-color)',
                        background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#00A896'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ tắt / Thời lượng</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                      {['08:00', '10:00'].map(t => (
                        <button key={t} onClick={() => setPumpOffTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${pumpOffTime === t ? '#00A896' : 'var(--border-color)'}`,
                          background: pumpOffTime === t ? 'rgba(0,168,150,0.15)' : 'var(--bg-btn-cancel)',
                          color: pumpOffTime === t ? '#00A896' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={pumpOffTime} onChange={e => setPumpOffTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-color)',
                        background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#00A896'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[{ l: 'Sau 1p', m: 1 }, { l: 'Sau 30p', m: 30 }, { l: 'Sau 1h', m: 60 }].map(item => (
                        <button key={item.l} onClick={() => {
                          const d = new Date(); d.setMinutes(d.getMinutes() + item.m);
                          setPumpOffTime(d.toTimeString().slice(0, 5));
                        }} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border-color)',
                          background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-btn-cancel-hover)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-btn-cancel)' }}
                        >{item.l}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={async () => {
                    const { error, data: dev } = await supabase.from('devices').update({
                      pump_on_time: pumpOnTime || null,
                      pump_off_time: pumpOffTime || null
                    }).eq('tank_id', activeDevice).select('id').single();
                    if (!error && dev) {
                      await supabase.from('relay_logs').insert({
                        device_id: dev.id,
                        relay_name: 'Pump',
                        action: 'ON',
                        triggered_by: 'AUTO'
                      });
                      showNotification('Đã lưu cấu hình thành công!');
                    }
                  }} style={{
                    width: '100%', padding: '10px', marginTop: 10, borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: theme === 'dark' ? 'rgba(0,168,150,0.25)' : '#00A896',
                    border: theme === 'dark' ? '1px solid rgba(0,168,150,0.4)' : 'none',
                    color: theme === 'dark' ? '#00A896' : '#fff',
                    cursor: 'pointer', transition: 'all 200ms'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(0,168,150,0.35)' : '#008F80'}
                    onMouseLeave={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(0,168,150,0.25)' : '#00A896'}
                  >
                    Lưu hẹn giờ Máy bơm
                  </button>
                </div>
              </div>

              {/* Đèn thủy sinh */}
              <div style={{
                padding: 24, borderRadius: 16, background: 'var(--bg-card)',
                border: `1px solid ${lightState ? '#FFB347' : 'rgba(26,45,74,0.5)'}`,
                transition: 'all 200ms', display: 'flex', flexDirection: 'column', gap: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: lightState ? 'rgba(255,179,71,0.15)' : 'var(--bg-btn-cancel)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms'
                    }}>
                      <Lightbulb size={24} color={lightState ? '#FFB347' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>Đèn thủy sinh</h3>
                      <p style={{ fontSize: 13, margin: 0, color: lightState ? '#FFB347' : 'var(--text-muted)', transition: 'color 200ms' }}>
                        {lightState ? 'Đang hoạt động' : 'Đang tắt'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newState = !lightState;
                      const { data: dev, error } = await supabase.from('devices')
                        .update({ relay_light_state: newState })
                        .eq('tank_id', activeDevice)
                        .select('id')
                        .single();
                      if (!error && dev) {
                        setLightState(newState);
                        await supabase.from('relay_logs').insert({
                          device_id: dev.id,
                          relay_name: 'Light',
                          action: newState ? 'ON' : 'OFF',
                          triggered_by: 'USER'
                        });
                      }
                    }}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', border: '1px solid var(--border-color)', cursor: 'pointer',
                      background: lightState ? '#FFB347' : 'var(--btn-power-bg)',
                      boxShadow: lightState ? '0 0 20px rgba(255,179,71,0.4)' : 'none',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms', flexShrink: 0
                    }}
                  >
                    <Power size={24} color={lightState ? '#fff' : 'var(--text-secondary)'} />
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  {(lightOnTime || lightOffTime) && (
                    <div style={{
                      background: 'var(--bg-btn-cancel)', border: '1px dashed #FFB347', borderRadius: 12, padding: '12px 16px', marginBottom: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Lịch tự động: 
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {lightOnTime && `Bật ${lightOnTime}`}
                          {lightOnTime && lightOffTime && ' - '}
                          {lightOffTime && `Tắt ${lightOffTime}`}
                        </span>
                      </div>
                      <button onClick={async () => {
                        const { error } = await supabase.from('devices').update({ light_on_time: null, light_off_time: null }).eq('tank_id', activeDevice);
                        if (!error) {
                          setLightOnTime('');
                          setLightOffTime('');
                          showNotification('Đã hủy lịch hẹn Đèn thủy sinh');
                        }
                      }} style={{
                        background: 'transparent', border: 'none', color: '#FF6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0
                      }}
                      >Hủy lịch</button>
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ bật</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {['07:00', '09:00', '12:00'].map(t => (
                        <button key={t} onClick={() => setLightOnTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${lightOnTime === t ? '#FFB347' : 'var(--border-color)'}`,
                          background: lightOnTime === t ? 'rgba(255,179,71,0.15)' : 'var(--bg-btn-cancel)',
                          color: lightOnTime === t ? '#FFB347' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={lightOnTime} onChange={e => setLightOnTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-color)',
                        background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#FFB347'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ tắt / Thời lượng</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                      {['08:00', '10:00'].map(t => (
                        <button key={t} onClick={() => setLightOffTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${lightOffTime === t ? '#FFB347' : 'var(--border-color)'}`,
                          background: lightOffTime === t ? 'rgba(255,179,71,0.15)' : 'var(--bg-btn-cancel)',
                          color: lightOffTime === t ? '#FFB347' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={lightOffTime} onChange={e => setLightOffTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-color)',
                        background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#FFB347'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[{ l: 'Sau 1p', m: 1 }, { l: 'Sau 30p', m: 30 }, { l: 'Sau 1h', m: 60 }].map(item => (
                        <button key={item.l} onClick={() => {
                          const d = new Date(); d.setMinutes(d.getMinutes() + item.m);
                          setLightOffTime(d.toTimeString().slice(0, 5));
                        }} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border-color)',
                          background: 'var(--bg-btn-cancel)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 150ms'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-btn-cancel-hover)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-btn-cancel)' }}
                        >{item.l}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={async () => {
                    const { error, data: dev } = await supabase.from('devices').update({
                      light_on_time: lightOnTime || null,
                      light_off_time: lightOffTime || null
                    }).eq('tank_id', activeDevice).select('id').single();
                    if (!error && dev) {
                      await supabase.from('relay_logs').insert({
                        device_id: dev.id,
                        relay_name: 'Light',
                        action: 'ON',
                        triggered_by: 'AUTO'
                      });
                      showNotification('Đã lưu cấu hình thành công!');
                    }
                  }} style={{
                    width: '100%', padding: '10px', marginTop: 10, borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: theme === 'dark' ? 'rgba(255,179,71,0.25)' : '#FF9500',
                    border: theme === 'dark' ? '1px solid rgba(255,179,71,0.4)' : 'none',
                    color: theme === 'dark' ? '#FFB347' : '#fff',
                    cursor: 'pointer', transition: 'all 200ms'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,179,71,0.35)' : '#E08300'}
                    onMouseLeave={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,179,71,0.25)' : '#FF9500'}
                  >
                    Lưu hẹn giờ Đèn thủy sinh
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ═══ TAB: SENSORS ═══ */}
          {activeTab === 'sensors' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {SENSOR_CFG.map(cfg => (
                  <button key={cfg.key}
                    onClick={() => setSelectedSensor(cfg.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1px solid ${selectedSensor === cfg.key ? cfg.color : 'var(--border-color)'}`, background: selectedSensor === cfg.key ? `${cfg.color}15` : 'var(--bg-btn-cancel)', color: selectedSensor === cfg.key ? cfg.color : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'all 180ms' }}
                  >
                    <cfg.icon size={13} />
                    {cfg.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 24, borderRadius: 20, background: 'var(--bg-card)', border: `1px solid ${selectedCfg.color}20`, marginBottom: 20 }}>
                {selectedSensor === 'waterLevel' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column' }}>
                    <selectedCfg.icon size={64} color={latest[selectedSensor] === 1 ? '#00A896' : '#FF6B6B'} style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: latest[selectedSensor] === 1 ? '#00A896' : '#FF6B6B' }}>
                      {latest[selectedSensor] === 1 ? 'Mực nước Ổn định' : 'Cảnh báo Cạn nước'}
                    </h2>
                  </div>
                ) : (
                  <>
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
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Khoảng an toàn</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: selectedCfg.color }}>{selectedCfg.good[0]}–{selectedCfg.good[1]}{selectedCfg.unit}</div>
                      </div>
                    </div>

                    <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={selectedCfg.color} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={selectedCfg.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={true} />
                          <XAxis
                            dataKey="time"
                            stroke="var(--text-primary)"
                            fontSize={11}
                            tickMargin={12}
                            minTickGap={15}
                            tick={{ fill: 'var(--text-primary)' }}
                            axisLine={{ stroke: 'var(--border-color)' }}
                          />
                          <YAxis
                            stroke="var(--text-primary)"
                            fontSize={11}
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(val) => val.toFixed(selectedCfg.key === 'ph' ? 2 : 1)}
                            tick={{ fill: 'var(--text-primary)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [`${value} ${selectedCfg.unit}`, selectedCfg.label]}
                            labelFormatter={(label) => `Lúc ${label}`}
                            labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                            itemStyle={{ color: selectedCfg.color, fontWeight: 700 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={selectedCfg.color}
                            fillOpacity={1}
                            fill="url(#colorBig)"
                            strokeWidth={3}
                            activeDot={{ r: 6, strokeWidth: 0, fill: selectedCfg.color }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>

              {selectedSensor !== 'waterLevel' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { label: 'Hiện tại', value: `${latest[selectedSensor]}${selectedCfg.unit}` },
                    { label: 'Trung bình', value: `${(selectedHistory.reduce((a, d) => a + d.value, 0) / selectedHistory.length).toFixed(2)}${selectedCfg.unit}` },
                    { label: 'Cao nhất', value: `${Math.max(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                    { label: 'Thấp nhất', value: `${Math.min(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '16px', borderRadius: 12, background: 'var(--bg-card)', border: `1px solid ${selectedCfg.color}15`, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: selectedCfg.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: ALERTS ═══ */}
          {activeTab === 'alerts' && (
            <div className="alerts-grid" style={{ display: 'grid', gap: 24, flex: 1, minHeight: 0 }}>
              {/* Cột trái: Main Content */}
              <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, overflowY: 'auto', paddingRight: 8 }}>
                <div style={{ border: `1px solid ${alertGlobalColor}40`, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ padding: '16px 20px', background: alertGlobalBg, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {alerts.length
                      ? <AlertTriangle size={20} color={alertGlobalColor} />
                      : <CheckCircle size={20} color="#00A896" />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: alertGlobalColor }}>
                        {alerts.length ? `${alerts.length} cảnh báo đang hoạt động` : 'Tất cả thông số trong ngưỡng an toàn'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cập nhật mỗi 3 giây</div>
                    </div>
                  </div>
                  {alerts.length > 0 && (
                    <div style={{ padding: 16 }}>
                      {alerts.map((a, i) => {
                        const isWarn = a.level === 'warn';
                        const color = isWarn ? '#FFB347' : '#FF6B6B';
                        const bg = isWarn ? 'rgba(255,179,71,0.07)' : 'rgba(255,107,107,0.07)';
                        const border = isWarn ? 'rgba(255,179,71,0.15)' : 'rgba(255,107,107,0.15)';
                        return (
                          <div key={i} style={{ padding: '14px 18px', borderRadius: 12, background: bg, border: `1px solid ${border}`, marginBottom: i < alerts.length - 1 ? 10 : 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <AlertTriangle size={14} color={color} style={{ flexShrink: 0 }} />
                            {a.msg}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: theme === 'dark' ? 'var(--text-muted)' : '#000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Hướng dẫn xử lý</h3>
                  {alerts.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Không có cảnh báo nào cần xử lý.</div>
                  ) : (
                    alerts.map((a, i) => {
                      const pondName = activePond?.name || 'Bể cá';
                      let title = '';
                      let desc = '';
                      let AlertIcon = AlertTriangle;
                      let iconColor = '#FF6B6B';

                      if (a.level === 'warn') {
                        title = `Cảnh báo sớm: ${a.label}`;
                        desc = `${pondName} đang có dấu hiệu bất thường về ${a.label}. Vui lòng theo dõi và kiểm tra lại hệ thống.`;
                        AlertIcon = AlertCircle;
                        iconColor = '#FFB347';
                      } else if (a.level === 'danger' && a.key === 'waterLevel') {
                        title = `Nguy hiểm: Cạn nước`;
                        desc = `${pondName} CẠN NƯỚC! Hãy kiểm tra van bơm ngay lập tức để cứu cá!`;
                        AlertIcon = Droplets;
                        iconColor = '#FF6B6B';
                      } else {
                        title = `Nguy hiểm: ${a.label} bất thường`;
                        desc = `${pondName} đang gặp NGUY HIỂM! ${a.label} đã tụt giảm/tăng vọt bất thường về mức ${a.val}${a.unit}. Hãy đến kiểm tra bể và can thiệp ngay lập tức!`;
                        AlertIcon = AlertTriangle;
                        iconColor = '#FF6B6B';
                      }

                      // Bổ sung Gợi ý xử lý
                      const cfg = SENSOR_CFG.find(c => c.key === a.key);
                      if (cfg) {
                        const isHigh = a.val > cfg.good[1];
                        const isLow = a.val < cfg.good[0];

                        if (a.key === 'temp') {
                          if (isHigh) desc += "\nGợi ý: Bạn có thể bật quạt tản nhiệt/chiller hoặc thả đá lạnh (bọc túi nilon) để làm mát hồ cá từ từ.";
                          else if (isLow) desc += "\nGợi ý: Bạn nên bật máy sưởi hồ cá để nâng nhiệt độ lên từ từ, tránh làm cá sốc nhiệt.";
                        } else if (a.key === 'ph') {
                          if (isHigh) desc += "\nGợi ý: Bạn có thể thay 20-30% nước hoặc sử dụng lá bàng/dung dịch giảm pH chuyên dụng.";
                          else if (isLow) desc += "\nGợi ý: Bạn có thể bổ sung san hô vụn vào bộ lọc hoặc dùng dung dịch tăng pH.";
                        } else if (a.key === 'tds') {
                          desc += "\nGợi ý: Vui lòng thay 20-30% nước và kiểm tra lại vật liệu lọc của hệ thống máy bơm.";
                        } else if (a.key === 'waterLevel') {
                          desc += "\nGợi ý: Vui lòng châm thêm nước hoặc bật máy bơm. Kiểm tra xem hồ cá có bị rạn nứt hay rò rỉ ở đâu không.";
                        }
                      }

                      return (
                        <div key={i} style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)', marginBottom: 8, display: 'flex', gap: 14 }}>
                          <AlertIcon size={24} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{desc}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Cột phải: Analytics & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, height: '100%' }}>
                {/* Widget Thống kê */}
                <div style={{ padding: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Phân bổ cảnh báo</h3>
                  <div style={{ height: 220, width: '100%' }}>
                    {alertDistData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 0, bottom: 20, left: 0 }}>
                          <defs>
                            <filter id="pie3d" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.3" floodColor="#000" />
                              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                              <feOffset dx="1" dy="2" result="offsetBlur" />
                              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                            </filter>
                          </defs>
                          <Pie
                            {...({ activeIndex: activePieIndex, activeShape: renderActiveShape } as any)}
                            onMouseEnter={onPieEnter}
                            data={alertDistData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={68}
                            paddingAngle={6}
                            stroke="none"
                            cornerRadius={4}
                          >
                            {alertDistData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} style={{ filter: theme === 'dark' ? 'url(#pie3d)' : 'none' }} />
                            ))}
                          </Pie>
                          <Legend formatter={(value) => <span style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : '#000' }}>{value}</span>} wrapperStyle={{ fontSize: 11, bottom: -4 }} verticalAlign="bottom" height={30} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'var(--text-muted)' }}>
                        Chưa có dữ liệu thống kê
                      </div>
                    )}
                  </div>
                </div>

                {/* Widget Lịch sử */}
                <div style={{ padding: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Lịch sử cảnh báo</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => { if (activeDevice) fetchAlertHistoryPage(currentHistoryPage - 1, activeDevice, historyCursors) }}
                        disabled={currentHistoryPage === 0 || historyLoading}
                        style={{ background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', color: currentHistoryPage === 0 ? (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : 'var(--text-primary)', cursor: currentHistoryPage === 0 || historyLoading ? 'not-allowed' : 'pointer', fontSize: 11, transition: 'all 200ms' }}
                      >Trang trước</button>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trang {currentHistoryPage + 1}</span>
                      <button
                        onClick={() => { if (activeDevice) fetchAlertHistoryPage(currentHistoryPage + 1, activeDevice, historyCursors) }}
                        disabled={!historyHasNext || historyLoading}
                        style={{ background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', color: !historyHasNext ? (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : 'var(--text-primary)', cursor: !historyHasNext || historyLoading ? 'not-allowed' : 'pointer', fontSize: 11, transition: 'all 200ms' }}
                      >Trang sau</button>
                    </div>
                  </div>
                  <div className="custom-scrollbar" style={{ background: theme === 'dark' ? 'var(--bg-card)' : '#F2F4F7', borderRadius: 12, border: '1px solid var(--border-color)', flex: 1, overflowY: 'auto' }}>
                    {alertHistory.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                        Chưa có lịch sử cảnh báo nào
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#152441', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Thời gian</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Loại</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Giá trị</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alertHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(h.created_at).toLocaleString('vi-VN')}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{h.alert_type}</td>
                              <td style={{ padding: '12px 16px', color: '#FF8C00', fontWeight: 500 }}>{h.actual_value}</td>
                              <td style={{ padding: '12px 16px', color: h.is_read ? '#00A896' : '#FF6B6B' }}>
                                {h.is_read ? 'Đã xem' : 'Mới'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Dialog: Thêm bể mới ── */}
      {addDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} color="#00A896" /> Thêm bể cá mới</div>}
          confirmText="Thêm bể"
          error={dialogError}
          onConfirm={handleAddConfirm}
          onCancel={() => setAddDialog(false)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên bể cá
            </label>
            <input
              autoFocus
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder="VD: Bể Rồng Phòng Ngủ"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Thể tích (Lít)
            </label>
            <input
              type="number"
              value={addVolume}
              onChange={e => setAddVolume(e.target.value)}
              placeholder="VD: 250"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Loài cá (Tùy chọn)
            </label>
            <select
              value={addSpeciesId}
              onChange={e => setAddSpeciesId(Number(e.target.value))}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms', appearance: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            >
              <option value={0} style={{ color: '#000' }}>-- Chọn loài cá --</option>
              {fishSpecies.map(sp => (
                <option key={sp.id} value={sp.id} style={{ color: '#000' }}>{sp.species_name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Mã thiết bị (MAC Address)
            </label>
            <input
              value={addMacAddress}
              onChange={e => setAddMacAddress(e.target.value)}
              placeholder="VD: 68:FE:71:16:A5:18 hoặc để trống"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Cấu hình bể cá ── */}
      {editDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={18} color="#4DA6FF" /> Cấu hình bể cá</div>}
          confirmText="Lưu thay đổi"
          error={dialogError}
          onConfirm={handleEditConfirm}
          onCancel={() => setEditDialog(null)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên bể cá
            </label>
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="VD: Bể Rồng Phòng Ngủ"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Thể tích (Lít)
            </label>
            <input
              type="number"
              value={editVolume}
              onChange={e => setEditVolume(e.target.value)}
              placeholder="VD: 250"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Loài cá (Tùy chọn)
            </label>
            <select
              value={editSpeciesId}
              onChange={e => setEditSpeciesId(Number(e.target.value))}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms', appearance: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            >
              <option value={0} style={{ color: '#000' }}>-- Chọn loài cá --</option>
              {fishSpecies.map(sp => (
                <option key={sp.id} value={sp.id} style={{ color: '#000' }}>{sp.species_name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Mã thiết bị (MAC Address)
            </label>
            <input
              value={editMacAddress}
              onChange={e => setEditMacAddress(e.target.value)}
              placeholder="VD: 68:FE:71:16:A5:18 hoặc để trống"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg-btn-cancel)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--btn-border)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Xác nhận xóa ── */}
      {deleteDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={18} color="#FF6B6B" /> Xóa bể cá</div>}
          message={`Bạn có chắc muốn xóa "${deleteDialog.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa bể"
          confirmColor="#FF6B6B"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog(null)}
        />
      )}

      {/* ── Custom Notification ── */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        zIndex: 1000,
        background: 'var(--bg-notif)',
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

      <style>{`
        /* ─── CSS Theme Variables ─── */
        :root, [data-theme='dark'] {
          --bg-main: linear-gradient(135deg, #060e1a 0%, #0a1628 60%, #0d2235 100%);
          --bg-sidebar: rgba(10,20,38,0.95);
          --bg-topbar: rgba(10,20,38,0.7);
          --bg-card: rgba(15,26,48,0.8);
          --bg-dialog: linear-gradient(135deg, #0d1a2e, #112240);
          --bg-tooltip: #112240;
          --bg-btn-cancel: rgba(255,255,255,0.04);
          --bg-btn-cancel-hover: rgba(255,255,255,0.08);
          --bg-nav-hover: rgba(255,255,255,0.05);
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.5);
          --text-nav: rgba(255,255,255,0.45);
          --text-muted: rgba(255,255,255,0.3);
          --border-color: rgba(26,45,74,0.5);
          --bg-notif: rgba(10, 25, 40, 0.95);
        }
        [data-theme='light'] {
          --bg-main: linear-gradient(135deg, #e8f4f8 0%, #ddeef8 60%, #cfe4f2 100%);
          --bg-sidebar: rgba(255,255,255,0.97);
          --bg-topbar: rgba(255,255,255,0.85);
          --bg-card: rgba(255,255,255,0.9);
          --bg-dialog: #ffffff;
          --bg-tooltip: #1e293b;
          --bg-btn-cancel: rgba(0,0,0,0.04);
          --bg-notif: var(--bg-card);
          --bg-btn-cancel-hover: rgba(0,0,0,0.08);
          --bg-nav-hover: rgba(0,0,0,0.04);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-nav: #64748b;
          --text-muted: #94a3b8;
          --border-color: rgba(0,0,0,0.1);
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dialogIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @media (max-width: 768px) { aside { display: none !important; } }
        @media (min-width: 1024px) { .alerts-grid { grid-template-columns: 1.5fr 1fr; } }
        @media (max-width: 1023px) { .alerts-grid { grid-template-columns: 1fr; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
