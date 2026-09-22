import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut, Sun, Moon, CheckCircle, Clock, MapPin, Phone,
  Briefcase, History, Wrench, Truck, Gauge, Zap,
  User, CalendarClock, ListChecks, ArrowLeft, ArrowRight, Layout,
  MessageSquare, Mail, Send, AlertTriangle, Pin, Package, Scan, CheckCircle2
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Design tokens & Theme variables ─────────────────────────────────────────
// Using a dynamic <style> injection to handle Light/Dark mode while keeping inline styling.
const ThemeStyles = ({ theme }: { theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark'
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root[data-theme="${theme}"] {
        --sp-bg-main: ${isDark ? '#060f1e' : '#f8fafc'};
        --sp-bg-sidebar: ${isDark ? 'rgba(10,18,38,0.98)' : 'rgba(255,255,255,0.98)'};
        --sp-bg-topbar: ${isDark ? 'rgba(6,15,30,0.9)' : 'rgba(255,255,255,0.9)'};
        --sp-bg-card: ${isDark ? '#112240' : '#ffffff'};
        --sp-bg-kanban-col: ${isDark ? '#0a1628' : '#f1f5f9'};
        --sp-bg-history-header: ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'};
        
        --sp-text-primary: ${isDark ? '#f1f5f9' : '#0f172a'};
        --sp-text-secondary: ${isDark ? '#94a3b8' : '#475569'};
        --sp-text-muted: ${isDark ? '#475569' : '#94a3b8'};
        
        --sp-border: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'};
        --sp-border-hover: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'};
        --sp-border-card: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
        --sp-border-col: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'};

        --sp-hover-bg: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
        --sp-hover-bg-strong: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
        
        --sp-input-bg: ${isDark ? 'rgba(0,0,0,0.2)' : '#ffffff'};
        
        --sp-shadow: ${isDark ? '0 2px 12px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.04)'};
        --sp-shadow-hover: ${isDark ? '0 10px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.12)' : '0 10px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)'};
        
        --sp-type-tag-bg: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
        --sp-type-tag-border: ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'};
        
        --sp-note-bg: ${isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.1)'};
        --sp-note-border: ${isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.2)'};
        
        --sp-danger-bg: ${isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.1)'};
      }
    `}} />
  )
}

const F = "'Inter', sans-serif"
const TEAL = '#00A896'
const TEAL_BG = 'rgba(0,168,150,0.1)'
const TEAL_BORDER = 'rgba(0,168,150,0.25)'

// ─── Types ───────────────────────────────────────────────────────────────────
type TaskType = 'packing' | 'delivery_install' | 'maintenance' | 'support'
type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

interface Task {
  id: string
  task_type: TaskType
  status: TaskStatus
  assigned_to: string
  title: string
  description?: string
  staff_note?: string
  order_id?: number
  tank_id?: number
  deadline?: string
  created_at: string
}


type SupportStatus = 'pending' | 'replied'

interface SupportRequest {
  id: string
  customerName: string
  email: string
  phone: string
  content: string
  createdAt: string
  status: SupportStatus
  staffReply?: string
}

const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  { id: 'SR001', customerName: 'Nguyễn Văn A', email: 'a.nguyen@example.com', phone: '0901234567', content: 'Tôi cần hỗ trợ cài đặt thiết bị qua app AquaCare.', createdAt: '2026-07-02T08:30:00', status: 'pending' },
  { id: 'SR002', customerName: 'Trần Thị B', email: 'b.tran@example.com', phone: '0909876543', content: 'Thiết bị đo pH của tôi báo lỗi đèn đỏ liên tục, nguyên nhân là gì?', createdAt: '2026-07-01T15:45:00', status: 'pending' },
  { id: 'SR003', customerName: 'Lê Văn C', email: 'c.le@example.com', phone: '0912345678', content: 'Làm sao để hiệu chuẩn cảm biến DO?', createdAt: '2026-06-30T10:15:00', status: 'replied', staffReply: 'Chào bạn, vào mục Cài đặt trên ứng dụng, chọn Hiệu chuẩn cảm biến và làm theo các bước hướng dẫn trên màn hình nhé.' },
]

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<TaskType, { icon: React.ElementType }> = {
  'Giao hàng & lắp đặt': { icon: Truck },
  'Bảo trì thiết bị':    { icon: Wrench },
}

const COLUMN_CONFIG = {
  todo:        { label: 'Chờ nhận việc',  icon: Clock,        accent: '#64748b', accentBg: 'rgba(100,116,139,0.1)',  accentBorder: 'rgba(100,116,139,0.2)' },
  in_progress: { label: 'Đang thực hiện', icon: Briefcase,    accent: TEAL,      accentBg: TEAL_BG,                  accentBorder: TEAL_BORDER },
  done:        { label: 'Hoàn thành',      icon: CheckCircle,  accent: '#10B981', accentBg: 'rgba(16,185,129,0.1)',   accentBorder: 'rgba(16,185,129,0.25)' },
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(dateStr: string, status: TaskStatus) {
  if (status === 'done') return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

const ghostBtnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8,
  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F,
  transition: 'filter 160ms, transform 160ms',
  userSelect: 'none',
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onAdvance }: { task: Task; onAdvance: (id: string) => void }) {
  const typeEntry = TYPE_CONFIG[task.type]
  const TypeIcon = typeEntry.icon
  const overdue = isOverdue(task.deadline, task.status)
  const actionLabel = task.status === 'todo' ? 'Nhận việc' : task.status === 'in_progress' ? 'Hoàn thành' : null

  return (
    <div
      style={{
        background: 'var(--sp-bg-card)',
        border: '1px solid var(--sp-border-card)',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: 'var(--sp-shadow)',
        transition: 'transform 260ms cubic-bezier(0.16,1,0.3,1), box-shadow 260ms ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--sp-shadow-hover)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--sp-shadow)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 100,
          background: 'var(--sp-type-tag-bg)',
          border: '1px solid var(--sp-type-tag-border)',
          color: 'var(--sp-text-secondary)', fontSize: 11, fontWeight: 600,
        }}>
          <TypeIcon size={10} />
          {task.type}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sp-text-muted)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
          #{task.id}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', lineHeight: 1.4 }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <User size={12} color="var(--sp-text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sp-text-secondary)' }}>{task.customerName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <MapPin size={12} color="var(--sp-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)', lineHeight: 1.5 }}>{task.address}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Phone size={12} color="var(--sp-text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)' }}>{task.phone}</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 7,
        padding: '8px 11px', borderRadius: 8,
        background: task.note ? 'var(--sp-note-bg)' : 'var(--sp-hover-bg)',
        border: task.note ? '1px solid var(--sp-note-border)' : '1px dashed var(--sp-border)',
      }}>
        <Pin size={11} color={task.note ? "#F59E0B" : "var(--sp-text-muted)"} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 11, color: task.note ? '#F59E0B' : 'var(--sp-text-muted)', lineHeight: 1.5 }}>
          {task.note || 'Không có ghi chú'}
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid var(--sp-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {overdue
            ? <AlertTriangle size={11} color="#FF6B6B" />
            : <CalendarClock size={11} color="var(--sp-text-muted)" />
          }
          <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? '#FF6B6B' : 'var(--sp-text-secondary)' }}>
            {overdue ? 'Quá hạn: ' : 'Hạn: '}{formatDate(task.deadline)}
          </span>
        </div>

        {actionLabel && (
          <button
            onClick={() => onAdvance(task.id)}
            style={{
              ...ghostBtnBase,
              background: TEAL_BG,
              color: TEAL,
              border: `1px solid ${TEAL_BORDER}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {actionLabel}
            {task.status === 'todo' ? <ArrowRight size={11} /> : <CheckCircle size={11} />}
          </button>
        )}

        {task.status === 'done' && (
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 4, 
            padding: '7px 0px', border: '1px solid transparent', /* Match button height */
            fontSize: 11, fontWeight: 700, color: '#10B981' 
          }}>
            <CheckCircle size={11} /> Hoàn thành
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ colKey, tasks, onAdvance }: {
  colKey: TaskStatus
  tasks: Task[]
  onAdvance: (id: string) => void
}) {
  const cfg = COLUMN_CONFIG[colKey]
  const ColIcon = cfg.icon

  return (
    <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--sp-border-col)' }}>
      <div style={{
        padding: '13px 16px',
        background: 'var(--sp-bg-sidebar)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--sp-border-col)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColIcon size={14} color={cfg.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sp-text-primary)', letterSpacing: '0.01em' }}>
            {cfg.label}
          </span>
        </div>
        <span style={{
          minWidth: 22, height: 22, borderRadius: 100, padding: '0 7px',
          background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}`,
          color: cfg.accent, fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {tasks.length}
        </span>
      </div>

      <div style={{
        flex: 1, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
        background: 'var(--sp-bg-kanban-col)',
        minHeight: 220,
      }}>
        {tasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', gap: 8 }}>
            <ColIcon size={28} color={cfg.accent} style={{ opacity: 0.18 }} />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--sp-text-muted)', textAlign: 'center' }}>Không có công việc</p>
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} onAdvance={onAdvance} />)
        )}
      </div>
    </div>
  )
}

// ─── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ task }: { task: Task }) {
  const TypeIcon = TYPE_CONFIG[task.type].icon
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '1fr 150px 145px 130px',
        alignItems: 'center', padding: '13px 20px', gap: 12,
        transition: 'background 140ms',
        borderBottom: '1px solid var(--sp-border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 3 }}>{task.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <User size={10} color="var(--sp-text-muted)" />
          <span style={{ fontSize: 11, color: 'var(--sp-text-secondary)' }}>{task.customerName}</span>
          <span style={{ color: 'var(--sp-text-muted)', fontSize: 10 }}>·</span>
          <Phone size={10} color="var(--sp-text-muted)" />
          <span style={{ fontSize: 11, color: 'var(--sp-text-secondary)' }}>{task.phone}</span>
        </div>
      </div>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center',
        padding: '3px 9px', borderRadius: 100,
        background: 'var(--sp-type-tag-bg)', color: 'var(--sp-text-secondary)',
        border: '1px solid var(--sp-type-tag-border)',
        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        <TypeIcon size={10} />
        {task.type}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--sp-text-secondary)' }}>
        <CalendarClock size={11} color="var(--sp-text-muted)" />
        {formatDate(task.deadline)}
      </span>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center',
        padding: '3px 9px', borderRadius: 100,
        background: 'rgba(16,185,129,0.1)', color: '#10B981',
        border: '1px solid rgba(16,185,129,0.2)',
        fontSize: 11, fontWeight: 700,
      }}>
        <CheckCircle size={10} /> Xong
      </span>
    </div>
  )
}

// ─── Support Card ─────────────────────────────────────────────────────────────
function SupportCard({ request, onResolve }: { request: SupportRequest; onResolve: (id: string, reply: string) => void }) {
  const isReplied = request.status === 'replied'
  const [replyText, setReplyText] = useState('')

  return (
    <div style={{
      background: 'var(--sp-bg-card)',
      border: '1px solid var(--sp-border-card)',
      borderRadius: 12,
      padding: '18px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: 'var(--sp-shadow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 6 }}>
            {request.customerName}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={12} color="var(--sp-text-muted)" /> {request.email}
            </span>
            <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Phone size={12} color="var(--sp-text-muted)" /> {request.phone}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {isReplied ? (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={11} /> Đã trả lời
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Chưa trả lời
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--sp-text-muted)', fontWeight: 500 }}>
            {new Date(request.createdAt).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        background: 'var(--sp-hover-bg)',
        borderRadius: 8,
        border: '1px solid var(--sp-border)',
        fontSize: 13, color: 'var(--sp-text-primary)', lineHeight: 1.65,
      }}>
        {request.content}
      </div>

      {!isReplied ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            placeholder="Nhập nội dung trả lời..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              minHeight: 84, padding: '10px 14px', borderRadius: 8,
              background: 'var(--sp-input-bg)', border: '1px solid var(--sp-border-hover)',
              color: 'var(--sp-text-primary)', fontFamily: F, fontSize: 13,
              resize: 'vertical', outline: 'none',
              transition: 'border-color 160ms',
            }}
            onFocus={e => { e.target.style.borderColor = TEAL_BORDER }}
            onBlur={e => { e.target.style.borderColor = 'var(--sp-border-hover)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                if (!replyText.trim()) return alert('Vui lòng nhập nội dung trả lời!')
                alert(`Gửi mail thành công đến ${request.email}`)
                onResolve(request.id, replyText)
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 8,
                background: TEAL, color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                transition: 'filter 160ms, transform 160ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)' }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <Send size={14} /> Gửi trả lời
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,168,150,0.07)',
          borderRadius: 8, border: `1px solid ${TEAL_BORDER}`,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle size={13} /> Phản hồi từ Staff
          </div>
          <div style={{ fontSize: 13, color: 'var(--sp-text-primary)', lineHeight: 1.6 }}>{request.staffReply}</div>
        </div>
      )}
    </div>
  )
}

// ─── Packing Station Mockup ───────────────────────────────────────────────────
// ─── Packing Station Real ───────────────────────────────────────────────────
function PackingStationUI({ userInfo }: { userInfo: any }) {
  const [packingTasks, setPackingTasks] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  
  // Lưu trữ các mã MAC đang nhập: key = `itemId_index`, value = chuỗi MAC
  const [macInputs, setMacInputs] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPackingTasks()
  }, [])

  const fetchPackingTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, orders(*, order_items(*))')
      .eq('task_type', 'packing')
      .eq('status', 'todo')
      // Lấy các task được gán cho nhân viên này (hoặc lấy hết để test)
      // .eq('assigned_to', userInfo.id) 
      .order('created_at', { ascending: true })
    
    if (data) {
      setPackingTasks(data)
      if (data.length > 0 && !selectedTaskId) {
        setSelectedTaskId(data[0].id)
      }
    }
  }

  const activeTask = packingTasks.find(t => t.id === selectedTaskId)
  const activeOrder = activeTask?.orders

  // Sinh danh sách các ô nhập liệu dựa trên order_items
  const requiredMacs: { itemId: string, name: string, index: number }[] = []
  if (activeOrder && activeOrder.order_items) {
    activeOrder.order_items.forEach((item: any) => {
      for (let i = 0; i < item.quantity; i++) {
        requiredMacs.push({ itemId: item.id, name: item.product_name, index: i })
      }
    })
  }

  const handleInputChange = (key: string, value: string) => {
    setMacInputs(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask || !activeOrder) return

    // Kiểm tra xem đã nhập đủ tất cả các mã MAC chưa
    const allFilled = requiredMacs.every(req => {
      const val = macInputs[`${req.itemId}_${req.index}`]
      return val && val.trim().length > 0
    })

    if (!allFilled) {
      alert('Vui lòng nhập đầy đủ mã MAC cho tất cả các thiết bị!')
      return
    }

    setIsSubmitting(true)

    // 1. Cập nhật device_macs vào từng order_item
    for (const item of activeOrder.order_items) {
      const macsForThisItem = requiredMacs
        .filter(req => req.itemId === item.id)
        .map(req => macInputs[`${req.itemId}_${req.index}`].trim())
      
      await supabase.from('order_items')
        .update({ device_macs: macsForThisItem })
        .eq('id', item.id)
    }

    // 2. Chuyển trạng thái task packing thành 'done'
    await supabase.from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', activeTask.id)

    // 3. Tự động sinh task Giao hàng (delivery_install) cho Shipper
    await supabase.from('tasks').insert({
      task_type: 'delivery_install',
      order_id: activeOrder.id,
      customer_id: activeOrder.user_id,
      title: `Giao hàng & Lắp đặt Đơn #${activeOrder.id}`,
      description: `Khách hàng: ${activeOrder.shipping_name}\nSĐT: ${activeOrder.shipping_phone}\nĐịa chỉ: ${activeOrder.shipping_address}`,
    })

    setSuccessMsg(`Đã đóng gói xong Đơn #${activeOrder.id}. Đã tạo việc giao hàng!`)
    setMacInputs({})
    setTimeout(() => setSuccessMsg(''), 4000)
    
    setIsSubmitting(false)
    fetchPackingTasks() // Cập nhật lại danh sách bên trái
  }

  return (
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 130px)' }}>
      {/* Left List */}
      <div style={{ width: 320, background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border-card)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sp-border)', background: 'var(--sp-bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Chờ đóng gói</span>
          <span style={{ background: TEAL_BG, color: TEAL, padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{packingTasks.length} đơn</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {packingTasks.map(t => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTaskId(t.id)}
              style={{ 
                padding: 16, borderRadius: 12, cursor: 'pointer',
                background: selectedTaskId === t.id ? 'var(--sp-hover-bg)' : 'transparent',
                border: `1px solid ${selectedTaskId === t.id ? TEAL_BORDER : 'var(--sp-border)'}`,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: selectedTaskId === t.id ? TEAL : 'var(--sp-text-primary)' }}>Đơn #{t.order_id}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.5 }}>
                <User size={12} style={{ flexShrink: 0 }} /> 
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.orders?.shipping_name}
                </span>
              </div>
            </div>
          ))}
          {packingTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--sp-text-muted)', fontSize: 13 }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              Đã hoàn thành tất cả đơn hàng!
            </div>
          )}
        </div>
      </div>

      {/* Right Scanner Area */}
      <div style={{ flex: 1, background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border-card)', borderRadius: 16, padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', position: 'relative' }}>
        
        {successMsg && (
          <div style={{ position: 'absolute', top: 32, background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, animation: 'fadeIn 0.3s', zIndex: 10 }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {!activeTask || !activeOrder ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', margin: 'auto 0' }}>
            <Package size={64} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px' }}>Không có đơn hàng nào được chọn</h2>
            <p>Vui lòng chọn đơn hàng từ danh sách bên trái để tiến hành đóng gói.</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'var(--sp-hover-bg)', borderRadius: 100, fontSize: 14, fontWeight: 600, color: 'var(--sp-text-secondary)', marginBottom: 16 }}>
                Đang xử lý đơn hàng <span style={{ color: TEAL, marginLeft: 4 }}>#{activeOrder.id}</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--sp-text-primary)' }}>
                Quét mã MAC thiết bị
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-muted)', marginBottom: 4 }}>SẢN PHẨM CẦN LẤY:</div>
              
              {requiredMacs.map((req, i) => (
                <div key={`${req.itemId}_${req.index}`} style={{ background: 'var(--sp-hover-bg)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--sp-border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{req.name} {req.index > 0 ? `(Bản thứ ${req.index + 1})` : ''}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Scan size={18} color={TEAL} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      required
                      autoFocus={i === 0}
                      type="text"
                      placeholder="Nhập MAC..."
                      value={macInputs[`${req.itemId}_${req.index}`] || ''}
                      onChange={e => handleInputChange(`${req.itemId}_${req.index}`, e.target.value)}
                      style={{
                        width: '100%', padding: '16px 16px 16px 48px', borderRadius: 8, boxSizing: 'border-box',
                        background: 'var(--sp-input-bg)', border: `1px solid var(--sp-border-hover)`,
                        color: 'var(--sp-text-primary)', fontSize: 16, fontWeight: 600, fontFamily: 'monospace',
                        outline: 'none', transition: 'all 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = TEAL; e.target.style.boxShadow = `0 0 0 3px ${TEAL_BG}` }}
                      onBlur={e => { e.target.style.borderColor = 'var(--sp-border-hover)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>
              ))}

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  marginTop: 8, padding: '18px 24px', background: TEAL, color: '#fff', border: 'none', borderRadius: 12, 
                  fontSize: 16, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                  opacity: isSubmitting ? 0.7 : 1, transition: 'filter 0.2s'
                }}
                onMouseEnter={e => !isSubmitting && (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => !isSubmitting && (e.currentTarget.style.filter = 'brightness(1)')}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đóng gói & Chuyển Giao hàng'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--sp-text-muted)', textAlign: 'center' }}>
              Nhập tay mã MAC in trên hộp sản phẩm tương ứng.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffPage() {
  const navigate = useNavigate()
  const userInfoStr = localStorage.getItem('user_info')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

  const [tasks, setTasks] = useState<Task[]>([])
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(INITIAL_SUPPORT_REQUESTS)
  const [activeTab, setActiveTab] = useState<'board' | 'packing' | 'history' | 'support'>('board')
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark'
  )

  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dashboard_theme', theme)
  }, [theme])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('cs_auth')
    localStorage.removeItem('cs_role')
    localStorage.removeItem('user_info')
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const advanceTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t
        const next: TaskStatus = t.status === 'todo' ? 'in_progress' : 'done'
        return { ...t, status: next }
      })
    )
  }

  const historyTasks = tasks.filter(t => t.status === 'done')
  const todoCount = tasks.filter(t => t.status === 'todo').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const doneCount = historyTasks.length
  const pendingSupportCount = supportRequests.filter(r => r.status === 'pending').length

  const handleResolveSupport = (id: string, reply: string) => {
    setSupportRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'replied', staffReply: reply } : r))
  }

  type TabId = 'board' | 'packing' | 'history' | 'support'

  const ROLE_TAB_MAP: Record<string, TabId[]> = {
    'staff_warehouse': ['packing', 'history'],
    'staff_shipper':   ['board',   'history'],
    'staff_support':   ['support', 'history'],
    'staff':           ['board', 'packing', 'history', 'support'],
  }

  const userRole = userInfo.role || 'staff'
  const allowedTabs = ROLE_TAB_MAP[userRole] ?? ROLE_TAB_MAP['staff']

  const ALL_TABS: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'board',   label: 'Bảng Công Việc',  icon: Layout,        badge: todoCount + inProgressCount },
    { id: 'packing', label: 'Trạm Đóng Gói',   icon: Package },
    { id: 'history', label: 'Lịch Sử Làm Việc', icon: History,       badge: doneCount },
    { id: 'support', label: 'Yêu Cầu Hỗ Trợ',  icon: MessageSquare, badge: pendingSupportCount },
  ]
  const visibleTabs = ALL_TABS.filter(t => allowedTabs.includes(t.id))

  const ROLE_LABELS: Record<string, string> = {
    staff_warehouse: 'Nhân viên kho',
    staff_shipper:   'Nhân viên giao hàng',
    staff_support:   'Nhân viên hỗ trợ',
    staff:           'Staff',
  }

  // Set default tab to first allowed tab for user role
  useEffect(() => {
    if (!allowedTabs.includes(activeTab as TabId)) {
      setActiveTab(allowedTabs[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sp-bg-main)', fontFamily: F, color: 'var(--sp-text-primary)', display: 'flex', flexDirection: 'column' }}>
      <ThemeStyles theme={theme} />

      {/* ── Topbar tier 1: Brand + User info + Actions ── */}
      <div style={{
        padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--sp-border)',
        background: 'var(--sp-bg-topbar)', backdropFilter: 'blur(14px)',
        flexShrink: 0, zIndex: 10, height: 56,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${TEAL}, #065f46)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px rgba(0,168,150,0.35)`,
          }}>
            <ListChecks size={15} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: TEAL }}>STAFF PORTAL</span>
            <span style={{ fontSize: 10, color: 'var(--sp-text-muted)', marginLeft: 6 }}>AquaCare System</span>
          </div>
        </div>

        {/* Right: User info + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)' }}>{userInfo.full_name || 'Nhân viên'}</div>
            <div style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>
              {ROLE_LABELS[userRole] || 'Staff'} 
              <span style={{ color: 'var(--sp-text-muted)', margin: '0 4px' }}>•</span> 
              <span style={{ color: 'var(--sp-text-muted)', fontWeight: 400 }}>{userInfo.email || ''}</span>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: 'var(--sp-border)' }} />

          <Link to="/"
            title="Về trang chủ"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--sp-border-hover)',
              background: 'var(--sp-hover-bg)', cursor: 'pointer',
              transition: 'all 180ms', color: 'var(--sp-text-secondary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg-strong)'; e.currentTarget.style.color = 'var(--sp-text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)'; e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
          >
            <ArrowLeft size={14} />
          </Link>

          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Đổi theme"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--sp-border-hover)',
              background: 'var(--sp-hover-bg)', cursor: 'pointer',
              transition: 'all 180ms', color: theme === 'dark' ? '#FFB347' : '#0ea5e9',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button onClick={handleLogout} title="Đăng xuất"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 600,
              background: 'var(--sp-danger-bg)', color: '#FF6B6B',
              transition: 'all 160ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
          >
            <LogOut size={13} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* ── Topbar tier 2: Tab navigation ── */}
      <div style={{
        padding: '0 28px',
        display: 'flex', alignItems: 'flex-end', gap: 4,
        borderBottom: '1px solid var(--sp-border)',
        background: 'var(--sp-bg-topbar)', backdropFilter: 'blur(14px)',
        flexShrink: 0,
      }}>
        {visibleTabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600,
                background: isActive ? 'var(--sp-bg-main)' : 'transparent',
                color: isActive ? TEAL : 'var(--sp-text-secondary)',
                borderTop: isActive ? `2px solid ${TEAL}` : '2px solid transparent',
                transition: 'all 160ms',
                position: 'relative',
                marginBottom: isActive ? -1 : 0,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--sp-text-primary)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 100, padding: '0 5px',
                  background: isActive ? TEAL : 'var(--sp-hover-bg-strong)',
                  color: isActive ? '#fff' : 'var(--sp-text-secondary)',
                  fontSize: 10, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 160ms',
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '22px 28px' }}>

          {activeTab === 'board' && (
            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', flex: 1, paddingBottom: 16 }}>
              {/* Kanban will be updated in next steps */}
              <h2 style={{ padding: 20 }}>Bảng công việc (Đang bảo trì)</h2>
            </div>
          )}

          {activeTab === 'packing' && <PackingStationUI userInfo={userInfo} />}

          {activeTab === 'history' && (
            <div style={{
              background: 'var(--sp-bg-card)',
              borderRadius: 12, border: '1px solid var(--sp-border-card)',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 150px 145px 130px',
                padding: '11px 20px', gap: 12,
                background: 'var(--sp-bg-history-header)',
                borderBottom: '1px solid var(--sp-border-card)',
              }}>
                {['Công việc', 'Loại', 'Ngày hạn', 'Trạng thái'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--sp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                ))}
              </div>

              {historyTasks.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <History size={32} color="#10B981" style={{ opacity: 0.16 }} />
                  <p style={{ margin: 0, color: 'var(--sp-text-muted)', fontSize: 13 }}>Chưa có công việc nào hoàn thành</p>
                </div>
              ) : (
                historyTasks.map(task => <HistoryRow key={task.id} task={task} />)
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 860, margin: '0 auto' }}>
              {supportRequests.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={32} color={TEAL} style={{ opacity: 0.18 }} />
                  <p style={{ margin: 0, color: 'var(--sp-text-muted)', fontSize: 13 }}>Không có yêu cầu hỗ trợ nào</p>
                </div>
              ) : (
                supportRequests.map(req => <SupportCard key={req.id} request={req} onResolve={handleResolveSupport} />)
              )}
            </div>
          )}
      </main>
    </div>
  )
}
