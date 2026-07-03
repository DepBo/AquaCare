import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut, Sun, Moon, CheckCircle, Clock, MapPin, Phone,
  Briefcase, History, ChevronRight, Wrench, Truck, Gauge, Zap,
  User, CalendarClock, ListChecks, ArrowRight, ArrowLeft, Layout,
  MessageSquare, Mail, Send, AlertTriangle, Pin,
} from 'lucide-react'

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
type TaskType = 'Lắp đặt mới' | 'Bảo trì thiết bị' | 'Giao hàng' | 'Hiệu chuẩn cảm biến'
type TaskStatus = 'todo' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  type: TaskType
  customerName: string
  address: string
  phone: string
  status: TaskStatus
  deadline: string
  note?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_TASKS: Task[] = [
  {
    id: 'T001',
    title: 'Lắp đặt hệ thống cảm biến ao tôm',
    type: 'Lắp đặt mới',
    customerName: 'Nguyễn Văn An',
    address: '45 Đường Lê Lợi, P. Bến Nghé, Q.1, TP.HCM',
    phone: '0912 345 678',
    status: 'todo',
    deadline: '2026-07-05',
    note: 'Khách hàng yêu cầu lắp trước 10h sáng',
  },
  {
    id: 'T002',
    title: 'Bảo trì định kỳ thiết bị AquaCare V2',
    type: 'Bảo trì thiết bị',
    customerName: 'Trần Thị Bích',
    address: '12 Nguyễn Trãi, P. Phạm Ngũ Lão, Q.1, TP.HCM',
    phone: '0987 654 321',
    status: 'todo',
    deadline: '2026-07-04',
  },
  {
    id: 'T003',
    title: 'Giao thiết bị cảm biến mới cho khách',
    type: 'Giao hàng',
    customerName: 'Lê Minh Khoa',
    address: '78 Trần Hưng Đạo, P. Cô Giang, Q.1, TP.HCM',
    phone: '0934 567 890',
    status: 'in_progress',
    deadline: '2026-07-03',
  },
  {
    id: 'T004',
    title: 'Hiệu chuẩn cảm biến nhiệt độ AquaCare V3',
    type: 'Hiệu chuẩn cảm biến',
    customerName: 'Phạm Quốc Hùng',
    address: '99 Đinh Tiên Hoàng, P. Đa Kao, Q.1, TP.HCM',
    phone: '0901 234 567',
    status: 'in_progress',
    deadline: '2026-07-06',
    note: 'Cần mang theo bộ dụng cụ hiệu chuẩn tiêu chuẩn',
  },
  {
    id: 'T005',
    title: 'Lắp đặt hệ thống giám sát ao cá lóc',
    type: 'Lắp đặt mới',
    customerName: 'Võ Thị Hồng',
    address: '5 Phan Đình Phùng, P. 17, Bình Thạnh, TP.HCM',
    phone: '0978 112 233',
    status: 'done',
    deadline: '2026-07-01',
  },
  {
    id: 'T006',
    title: 'Vận chuyển & bàn giao thiết bị V1',
    type: 'Giao hàng',
    customerName: 'Huỳnh Thanh Tâm',
    address: '22 Cách Mạng Tháng 8, P.5, Q.3, TP.HCM',
    phone: '0865 998 877',
    status: 'done',
    deadline: '2026-06-30',
  },
]

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
  'Lắp đặt mới':       { icon: Zap },
  'Bảo trì thiết bị':  { icon: Wrench },
  'Giao hàng':          { icon: Truck },
  'Hiệu chuẩn cảm biến': { icon: Gauge },
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

      {task.note && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          padding: '8px 11px', borderRadius: 8,
          background: 'var(--sp-note-bg)',
          border: '1px solid var(--sp-note-border)',
        }}>
          <Pin size={11} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11, color: '#F59E0B', lineHeight: 1.5 }}>{task.note}</span>
        </div>
      )}

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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#10B981' }}>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffPage() {
  const navigate = useNavigate()
  const userInfoStr = localStorage.getItem('user_info')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(INITIAL_SUPPORT_REQUESTS)
  const [activeTab, setActiveTab] = useState<'board' | 'history' | 'support'>('board')
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark'
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dashboard_theme', theme)
  }, [theme])

  const handleLogout = () => {
    localStorage.removeItem('cs_auth')
    localStorage.removeItem('cs_role')
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

  const SIDEBAR_TABS = [
    { id: 'board',   label: 'Bảng công việc',  icon: Layout },
    { id: 'history', label: 'Lịch sử làm việc', icon: History },
    { id: 'support', label: 'Yêu cầu hỗ trợ',  icon: MessageSquare },
  ] as const

  const topBadge = activeTab === 'board'
    ? `${todoCount + inProgressCount} việc đang chờ`
    : activeTab === 'history'
    ? `${doneCount} việc hoàn thành`
    : `${pendingSupportCount} chưa trả lời`

  const topTitle = activeTab === 'board'
    ? <><Layout size={17} color={TEAL} /> Bảng Công Việc</>
    : activeTab === 'history'
    ? <><History size={17} color={TEAL} /> Lịch Sử Làm Việc</>
    : <><MessageSquare size={17} color={TEAL} /> Yêu Cầu Hỗ Trợ</>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sp-bg-main)', fontFamily: F, color: 'var(--sp-text-primary)', display: 'flex' }}>
      <ThemeStyles theme={theme} />

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 60, flexShrink: 0,
        background: 'var(--sp-bg-sidebar)',
        borderRight: '1px solid var(--sp-border)',
        backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 260ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>

        <div
          style={{
            padding: '18px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '1px solid var(--sp-border)',
            cursor: 'pointer',
            transition: 'background 160ms',
          }}
          onClick={() => setSidebarOpen(o => !o)}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${TEAL}, #065f46)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px rgba(0,168,150,0.35)`,
          }}>
            <ListChecks size={17} color="white" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: TEAL, display: 'block', whiteSpace: 'nowrap' }}>STAFF PORTAL</span>
              <span style={{ fontSize: 10, color: 'var(--sp-text-muted)', whiteSpace: 'nowrap' }}>AquaCare System</span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div style={{ padding: '12px 14px', display: 'flex', gap: 5 }}>
            {[
              { label: 'Chờ',  count: todoCount },
              { label: 'Đang', count: inProgressCount },
              { label: 'Xong', count: doneCount },
              { label: 'HT',   count: pendingSupportCount },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, padding: '7px 2px',
                borderRadius: 8,
                background: 'var(--sp-hover-bg)',
                border: '1px solid var(--sp-border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEAL }}>{s.count}</div>
                <div style={{ fontSize: 9, color: 'var(--sp-text-muted)', fontWeight: 600, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <nav style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SIDEBAR_TABS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', borderRadius: 9,
                  border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600,
                  background: isActive ? TEAL_BG : 'transparent',
                  color: isActive ? TEAL : 'var(--sp-text-secondary)',
                  transition: 'all 160ms', whiteSpace: 'nowrap', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sp-hover-bg)'; if (!isActive) e.currentTarget.style.color = 'var(--sp-text-primary)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; if (!isActive) e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {sidebarOpen && item.label}
                {sidebarOpen && isActive && <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--sp-border)' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)', whiteSpace: 'nowrap' }}>
                {userInfo.full_name || 'Người dùng'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--sp-text-muted)', whiteSpace: 'nowrap', marginTop: 1 }}>
                {userInfo.email || ''}
              </span>
            </div>
          )}

          <Link to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 12px', borderRadius: 9,
              textDecoration: 'none', color: 'var(--sp-text-secondary)',
              fontFamily: F, fontSize: 13, fontWeight: 600,
              transition: 'all 160ms', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)'; e.currentTarget.style.color = 'var(--sp-text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
          >
            <ArrowLeft size={15} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Về trang chủ'}
          </Link>

          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600,
              background: 'transparent', color: '#FF6B6B',
              transition: 'all 160ms', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-danger-bg)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* Topbar */}
        <div style={{
          padding: '13px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--sp-border)',
          background: 'var(--sp-bg-topbar)', backdropFilter: 'blur(14px)',
          flexShrink: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sp-text-primary)' }}>
              {topTitle}
            </h1>
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 100,
              background: TEAL_BG, color: TEAL,
              border: `1px solid ${TEAL_BORDER}`, fontWeight: 700,
            }}>
              {topBadge}
            </span>
          </div>

          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 9,
              border: '1px solid var(--sp-border-hover)',
              background: 'var(--sp-hover-bg)', cursor: 'pointer',
              transition: 'all 180ms',
              color: theme === 'dark' ? '#FFB347' : '#0ea5e9',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>

          {activeTab === 'board' && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minHeight: 'calc(100vh - 130px)' }}>
              {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(colKey => (
                <KanbanColumn
                  key={colKey}
                  colKey={colKey}
                  tasks={tasks.filter(t => t.status === colKey)}
                  onAdvance={advanceTask}
                />
              ))}
            </div>
          )}

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
        </div>
      </main>
    </div>
  )
}
