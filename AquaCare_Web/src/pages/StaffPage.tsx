import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut, CheckCircle, Clock, MapPin, Phone,
  Briefcase, History, Wrench, Truck,
  User, CalendarClock, ArrowLeft, ArrowRight, Layout,
  MessageSquare, Mail, Send, AlertTriangle, Pin, Package, Scan, CheckCircle2, Eye, X, Tag, AlertCircle
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { InnerMoonToggle } from '../components/InnerMoonToggle'
import { clearVerifiedRole } from '../authRoleCache'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

const getInitialsAvatar = (name: string) => {
  if (!name) return 'S'
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return words[0][0].toUpperCase()
}

// ─── Minimalist Theme Setup (Matching Portal Palette & IDE Dark Mode) ─────────────────────────────────
const ThemeStyles = ({ theme }: { theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark'
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      :root[data-theme="${theme}"] {
        --sp-bg-main: ${isDark ? '#141414' : '#f8fafc'};
        --sp-bg-sidebar: ${isDark ? '#1f1f1f' : '#ffffff'};
        --sp-bg-topbar: ${isDark ? '#1f1f1f' : '#ffffff'};
        --sp-bg-card: ${isDark ? '#1f1f1f' : '#ffffff'};
        --sp-bg-kanban-col: ${isDark ? '#1a1a1a' : '#f1f5f9'};
        --sp-bg-history-header: ${isDark ? '#27272a' : '#f1f5f9'};
        
        --sp-text-primary: ${isDark ? '#f4f4f5' : '#0f172a'};
        --sp-text-secondary: ${isDark ? '#a1a1aa' : '#334155'};
        --sp-text-muted: ${isDark ? '#71717a' : '#475569'};
        
        --sp-border: ${isDark ? '#333333' : '#cbd5e1'};
        --sp-border-hover: ${isDark ? '#444444' : '#94a3b8'};
        --sp-border-card: ${isDark ? '#333333' : '#cbd5e1'};
        --sp-border-col: ${isDark ? '#2d2d2d' : '#e2e8f0'};

        --sp-hover-bg: ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'};
        --sp-hover-bg-strong: ${isDark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'};
        
        --sp-input-bg: ${isDark ? '#181818' : '#ffffff'};
        
        --sp-shadow: ${isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)'};
        --sp-shadow-hover: ${isDark ? '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px #333333' : '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px #cbd5e1'};
        
        --sp-type-tag-bg: ${isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'};
        --sp-type-tag-border: ${isDark ? '#3b3b3e' : '#cbd5e1'};
        
        --sp-note-bg: ${isDark ? 'rgba(245,158,11,0.12)' : '#fef3c7'};
        --sp-note-border: ${isDark ? 'rgba(245,158,11,0.25)' : '#fde68a'};
        
        --sp-danger-bg: ${isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'};
        
        --sp-primary: #0284c7;
        --sp-primary-bg: ${isDark ? 'rgba(2,132,199,0.2)' : '#e0f2fe'};
        --sp-primary-border: ${isDark ? 'rgba(2,132,199,0.4)' : '#bae6fd'};
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}} />
  )
}

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
  type?: string
  customerName?: string
  address?: string
  phone?: string
  note?: string
  orderItems?: Array<{
    id?: string
    product_name: string
    quantity: number
    product_price?: number
    device_macs?: string[]
  }>
  totalAmount?: number
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
  address?: string
  assigned_to?: string
}

const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  { id: 'SR001', customerName: 'Nguyễn Văn A', email: 'a.nguyen@example.com', phone: '0901234567', content: 'Tôi cần hỗ trợ cài đặt thiết bị qua app AquaCare.', createdAt: '2026-07-02T08:30:00', status: 'pending' },
  { id: 'SR002', customerName: 'Trần Thị B', email: 'b.tran@example.com', phone: '0909876543', content: 'Thiết bị đo pH của tôi báo lỗi đèn đỏ liên tục, nguyên nhân là gì?', createdAt: '2026-07-01T15:45:00', status: 'pending' },
  { id: 'SR003', customerName: 'Lê Văn C', email: 'c.le@example.com', phone: '0912345678', content: 'Làm sao để hiệu chuẩn cảm biến DO?', createdAt: '2026-06-30T10:15:00', status: 'replied', staffReply: 'Chào bạn, vào mục Cài đặt trên ứng dụng, chọn Hiệu chuẩn cảm biến và làm theo các bước hướng dẫn trên màn hình nhé.' },
]

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType }> = {
  'packing': { icon: Package },
  'delivery_install': { icon: Truck },
  'maintenance': { icon: Wrench },
  'support': { icon: MessageSquare },
  'Giao hàng & lắp đặt': { icon: Truck },
  'Bảo trì thiết bị': { icon: Wrench },
}

const COLUMN_CONFIG: Record<string, { label: string; icon: React.ElementType; accent: string; accentBg: string; accentBorder: string }> = {
  todo: { label: 'Chờ nhận việc', icon: Clock, accent: '#64748b', accentBg: 'rgba(100,116,139,0.1)', accentBorder: 'rgba(100,116,139,0.2)' },
  in_progress: { label: 'Đang thực hiện', icon: Briefcase, accent: '#0284c7', accentBg: 'var(--sp-primary-bg)', accentBorder: 'var(--sp-primary-border)' },
  done: { label: 'Hoàn thành', icon: CheckCircle, accent: '#16a34a', accentBg: 'rgba(22,163,74,0.1)', accentBorder: 'rgba(22,163,74,0.25)' },
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
  padding: '6px 14px', borderRadius: 6,
  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
  transition: 'filter 160ms, transform 160ms',
  userSelect: 'none', whiteSpace: 'nowrap', flexShrink: 0
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function parseMaintenanceDesc(desc?: string) {
  if (!desc) return { customerName: '', phone: '', email: '', address: '', customerRequest: '', cskhReply: '' }

  const custMatch = desc.match(/Khách hàng:\s*([^\n\r]+?)(?=\s*(?:SĐT|SDT|Email|Địa chỉ|-------------------)|$)/i)
  const phoneMatch = desc.match(/(?:SĐT|SDT):\s*([^\n\r]+?)(?=\s*(?:Email|Địa chỉ|-------------------)|$)/i)
  const emailMatch = desc.match(/Email:\s*([^\n\r]+?)(?=\s*(?:Địa chỉ|-------------------)|$)/i)
  const addrMatch = desc.match(/Địa chỉ:\s*([^\n\r]+?)(?=\s*(?:-------------------|NỘI DUNG|YÊU CẦU)|$)/i)

  const reqMatch = desc.match(/(?:NỘI DUNG (?:YÊU CẦU|THẮC MẮC\s*\/\s*CÂU HỎI|THẮC MẮC)|YÊU CẦU HỖ TRỢ|CÂU HỎI):?\s*([\s\S]*?)(?:-------------------|PHẢN HỒI CSKH:|$)/i)
  const replyMatch = desc.match(/PHẢN HỒI CSKH:?\s*([\s\S]*?)(?:-------------------|$)/i)

  const clean = (s?: string) => (s ? s.replace(/-{3,}/g, '').trim() : '')

  return {
    customerName: clean(custMatch ? custMatch[1] : ''),
    phone: clean(phoneMatch ? phoneMatch[1] : ''),
    email: clean(emailMatch ? emailMatch[1] : ''),
    address: clean(addrMatch ? addrMatch[1] : ''),
    customerRequest: clean(reqMatch ? reqMatch[1] : ''),
    cskhReply: clean(replyMatch ? replyMatch[1] : '')
  }
}

function TaskCard({ task, onAdvance }: { task: Task; onAdvance: (id: string) => void }) {
  const typeEntry = TYPE_CONFIG[task.type || task.task_type] || { icon: Briefcase }
  const TypeIcon = typeEntry.icon
  const overdue = task.deadline ? isOverdue(task.deadline, task.status) : false
  const actionLabel = task.status === 'todo' ? 'Nhận việc' : task.status === 'in_progress' ? 'Hoàn thành' : null
  const parsedMaint = task.task_type === 'maintenance' ? parseMaintenanceDesc(task.description) : null

  return (
    <div
      style={{
        background: 'var(--sp-bg-card)',
        border: '1px solid var(--sp-border-card)',
        borderRadius: 8,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: 'var(--sp-shadow)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
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
          color: 'var(--sp-text-secondary)', fontSize: 11.5, fontWeight: 600,
        }}>
          <TypeIcon size={12} />
          {task.type || task.task_type}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-text-muted)', fontFamily: 'monospace' }}>
          #{task.id}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', lineHeight: 1.4 }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <User size={13} color="var(--sp-text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sp-text-primary)' }}>
            {parsedMaint?.customerName || task.customerName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <MapPin size={13} color="var(--sp-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', lineHeight: 1.4 }}>
            {parsedMaint?.address || task.address}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Phone size={13} color="var(--sp-text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)' }}>
            {parsedMaint?.phone || task.phone}
          </span>
        </div>
      </div>

      {/* Maintenance Request Content & CSKH Reply */}
      {task.task_type === 'maintenance' && (() => {
        const { customerRequest, cskhReply } = parsedMaint || parseMaintenanceDesc(task.description)
        if (!customerRequest && !cskhReply) return null
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customerRequest && (
              <div style={{
                padding: '10px 12px', borderRadius: 6,
                background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--sp-primary)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase' }}>
                  <MessageSquare size={12} /> Nội dung yêu cầu:
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--sp-text-primary)', lineHeight: 1.45, fontWeight: 500 }}>
                  {customerRequest}
                </div>
              </div>
            )}
            {cskhReply && (
              <div style={{
                padding: '10px 12px', borderRadius: 6,
                background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase' }}>
                  <CheckCircle2 size={12} /> Phản hồi CSKH:
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--sp-text-primary)', lineHeight: 1.45, fontWeight: 500 }}>
                  {cskhReply}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {(task.note || (task.task_type !== 'maintenance' && !task.description)) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          padding: '8px 12px', borderRadius: 6,
          background: task.note ? 'var(--sp-note-bg)' : 'var(--sp-hover-bg)',
          border: task.note ? '1px solid var(--sp-note-border)' : '1px dashed var(--sp-border)',
        }}>
          <Pin size={12} color={task.note ? "#F59E0B" : "var(--sp-text-muted)"} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: task.note ? '#d97706' : 'var(--sp-text-muted)', lineHeight: 1.4, fontWeight: task.note ? 600 : 400 }}>
            {task.note || 'Không có ghi chú'}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid var(--sp-border)', gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {overdue
            ? <AlertTriangle size={12} color="#ef4444" />
            : <CalendarClock size={12} color="var(--sp-text-muted)" />
          }
          <span style={{ fontSize: 12, fontWeight: 600, color: overdue ? '#ef4444' : 'var(--sp-text-secondary)' }}>
            {task.deadline ? (overdue ? 'Quá hạn: ' : 'Hạn: ') + formatDate(task.deadline) : 'Chưa có hạn'}
          </span>
        </div>

        {actionLabel && (
          <button
            onClick={() => onAdvance(task.id)}
            style={{
              ...ghostBtnBase,
              background: 'var(--sp-primary)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {actionLabel}
            {task.status === 'todo' ? <ArrowRight size={12} /> : <CheckCircle size={12} />}
          </button>
        )}

        {task.status === 'done' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 700, color: '#16a34a'
          }}>
            <CheckCircle size={12} /> Hoàn thành
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
    <div style={{ flex: 1, minWidth: 290, display: 'flex', flexDirection: 'column', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--sp-border-col)' }}>
      <div style={{
        padding: '12px 16px',
        background: 'var(--sp-bg-sidebar)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--sp-border-col)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColIcon size={15} color={cfg.accent} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
            {cfg.label}
          </span>
        </div>
        <span style={{
          minWidth: 22, height: 22, borderRadius: 100, padding: '0 8px',
          background: cfg.accentBg, border: `1px solid ${cfg.accentBorder}`,
          color: cfg.accent, fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {tasks.length}
        </span>
      </div>

      <div style={{
        flex: 1, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'var(--sp-bg-kanban-col)',
        minHeight: 220,
      }}>
        {tasks.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', gap: 8 }}>
            <ColIcon size={32} color={cfg.accent} style={{ opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--sp-text-muted)', textAlign: 'center' }}>Không có công việc</p>
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} onAdvance={onAdvance} />)
        )}
      </div>
    </div>
  )
}

// ─── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ task, onViewDetails }: { task: Task; onViewDetails: (task: Task) => void }) {
  const TypeIcon = (TYPE_CONFIG[task.type || task.task_type] || { icon: Briefcase }).icon
  const hasItems = task.orderItems && task.orderItems.length > 0

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 140px 120px 120px',
        alignItems: 'center', padding: '14px 20px', gap: 12,
        transition: 'background 140ms',
        borderBottom: '1px solid var(--sp-border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 3 }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <User size={12} color="var(--sp-text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)', fontWeight: 500 }}>{task.customerName || task.description?.split('\n')[0] || 'N/A'}</span>
          <span style={{ color: 'var(--sp-text-muted)', fontSize: 11 }}>·</span>
          <Phone size={12} color="var(--sp-text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--sp-text-secondary)' }}>{task.phone || 'N/A'}</span>
          {hasItems && (
            <>
              <span style={{ color: 'var(--sp-text-muted)', fontSize: 11 }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--sp-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Package size={11} /> {task.orderItems?.length} sản phẩm
              </span>
            </>
          )}
        </div>
      </div>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center',
        padding: '4px 10px', borderRadius: 100,
        background: 'var(--sp-type-tag-bg)', color: 'var(--sp-text-secondary)',
        border: '1px solid var(--sp-type-tag-border)',
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        <TypeIcon size={12} />
        {task.type || task.task_type}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--sp-text-secondary)' }}>
        <CalendarClock size={12} color="var(--sp-text-muted)" />
        {task.deadline ? formatDate(task.deadline) : formatDate(task.created_at)}
      </span>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center',
        padding: '4px 10px', borderRadius: 100,
        background: 'rgba(16,185,129,0.12)', color: '#16a34a',
        border: '1px solid rgba(16,185,129,0.25)',
        fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
      }}>
        <CheckCircle size={12} /> Xong
      </span>

      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => onViewDetails(task)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center',
            padding: '6px 12px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid var(--sp-border)',
            color: 'var(--sp-primary)',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'all 160ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <Eye size={12} /> Chi tiết
        </button>
      </div>
    </div>
  )
}

// ─── Task Details Modal ───────────────────────────────────────────────────────
function TaskDetailsModal({ task, onClose }: { task: Task; onClose: () => void }) {
  if (!task) return null
  const items = task.orderItems || []
  const isMaintenance = task.task_type === 'maintenance' || task.type === 'maintenance'
  const parsed = isMaintenance ? parseMaintenanceDesc(task.description) : null
  const customerName = (parsed?.customerName) || task.customerName
  const phone = (parsed?.phone) || task.phone
  const address = (parsed?.address) || task.address

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)',
        borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', boxShadow: 'var(--sp-shadow)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--sp-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--sp-bg-sidebar)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: isMaintenance ? 'rgba(217, 119, 6, 0.12)' : 'var(--sp-primary-bg)',
              border: `1px solid ${isMaintenance ? 'rgba(217, 119, 6, 0.3)' : 'var(--sp-primary-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isMaintenance ? '#d97706' : 'var(--sp-primary)'
            }}>
              {isMaintenance ? <Wrench size={18} /> : <Package size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
                {isMaintenance ? `Chi tiết nhiệm vụ bảo trì #${task.id}` : `Chi tiết đóng gói đơn hàng #${task.order_id || task.id}`}
              </h3>
              <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>
                Ngày hoàn thành: {formatDate(task.created_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--sp-text-muted)',
              cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--sp-text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--sp-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer Info Card */}
          <div style={{
            background: 'var(--sp-hover-bg)', padding: '14px 18px', borderRadius: 8,
            border: '1px solid var(--sp-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>KHÁCH HÀNG</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)' }}>{customerName}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', marginTop: 2 }}>{phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                {isMaintenance ? 'ĐỊA CHỈ BẢO TRÌ TẬN NHÀ' : 'ĐỊA CHỈ GIAO HÀNG / BẢO TRÌ'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', lineHeight: 1.4 }}>{address}</div>
            </div>
          </div>

          {/* Maintenance Description Section */}
          {isMaintenance && parsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parsed.customerRequest && (
                <div style={{
                  background: 'rgba(2, 132, 199, 0.08)', padding: '14px 18px', borderRadius: 8,
                  border: '1px solid rgba(2, 132, 199, 0.25)', display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--sp-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={13} /> NỘI DUNG YÊU CẦU TỪ KHÁCH HÀNG
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--sp-text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                    {parsed.customerRequest}
                  </div>
                </div>
              )}

              {parsed.cskhReply && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)', padding: '14px 18px', borderRadius: 8,
                  border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} /> PHẢN HỒI & CHỈ DẪN TỪ CSKH
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--sp-text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                    {parsed.cskhReply}
                  </div>
                </div>
              )}

              {!parsed.customerRequest && !parsed.cskhReply && task.description && (
                <div style={{
                  background: 'rgba(2, 132, 199, 0.08)', padding: '14px 18px', borderRadius: 8,
                  border: '1px solid rgba(2, 132, 199, 0.25)', display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--sp-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={13} /> GHI CHÚ / YÊU CẦU
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--sp-text-primary)', lineHeight: 1.5 }}>
                    {task.description}
                  </div>
                </div>
              )}

              {task.staff_note && (
                <div style={{
                  background: 'var(--sp-hover-bg)', padding: '12px 16px', borderRadius: 8,
                  border: '1px solid var(--sp-border)', fontSize: 13, color: 'var(--sp-text-secondary)'
                }}>
                  <strong>Ghi chú nội bộ:</strong> {task.staff_note}
                </div>
              )}
            </div>
          )}

          {/* Generic Description for other task types */}
          {task.task_type !== 'maintenance' && task.description && (
            <div style={{
              background: 'var(--sp-hover-bg)', padding: '14px 18px', borderRadius: 8,
              border: '1px solid var(--sp-border)', display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={13} /> THÔNG TIN NHIỆM VỤ
              </div>
              <div style={{ fontSize: 13, color: 'var(--sp-text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {task.description}
              </div>
            </div>
          )}

          {/* Product Items List - Only for Non-Maintenance Tasks */}
          {task.task_type !== 'maintenance' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                SẢN PHẨM / THIẾT BỊ ({items.length})
              </div>

              {items.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sp-text-muted)', fontSize: 13, background: 'var(--sp-hover-bg)', borderRadius: 8 }}>
                  Không tìm thấy danh sách chi tiết sản phẩm.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map((item, idx) => {
                    const macs = item.device_macs || []
                    const itemPrice = item.product_price || 0
                    const subtotal = itemPrice * item.quantity

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)',
                          borderRadius: 8, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{item.product_name}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-primary)', background: 'var(--sp-primary-bg)', padding: '2px 8px', borderRadius: 100 }}>
                                x{item.quantity}
                              </span>
                            </div>
                            {itemPrice > 0 && (
                              <div style={{ fontSize: 12.5, color: 'var(--sp-text-muted)', marginTop: 2 }}>
                                Đơn giá: {itemPrice.toLocaleString('vi-VN')} ₫
                              </div>
                            )}
                          </div>

                          {subtotal > 0 && (
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-primary)' }}>
                              {subtotal.toLocaleString('vi-VN')} ₫
                            </div>
                          )}
                        </div>

                        {/* MAC Addresses List */}
                        <div style={{ paddingTop: 8, borderTop: '1px dashed var(--sp-border)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Scan size={12} color="var(--sp-primary)" /> MÃ MAC THIẾT BỊ ĐÃ GÓI:
                          </div>
                          {macs.length === 0 ? (
                            <span style={{ fontSize: 12, color: 'var(--sp-text-muted)', fontStyle: 'italic' }}>Chưa ghi nhận mã MAC</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {macs.map((mac, mIdx) => (
                                <div
                                  key={mIdx}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'var(--sp-hover-bg-strong)', border: '1px solid var(--sp-border-hover)',
                                    padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace',
                                    fontSize: 12, fontWeight: 600, color: 'var(--sp-text-primary)'
                                  }}
                                >
                                  <Tag size={11} color="var(--sp-primary)" />
                                  <span>{mac}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Total Amount Summary if available */}
          {task.task_type !== 'maintenance' && task.totalAmount && task.totalAmount > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px', background: 'var(--sp-primary-bg)', border: '1px solid var(--sp-primary-border)',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--sp-text-primary)' }}>Tổng giá trị đơn hàng:</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--sp-primary)' }}>
                {task.totalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--sp-border)', background: 'var(--sp-bg-sidebar)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: 6, background: 'var(--sp-hover-bg-strong)',
              border: '1px solid var(--sp-border-hover)', color: 'var(--sp-text-primary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Support Card ─────────────────────────────────────────────────────────────
function SupportCard({
  request,
  onResolve,
  onCreateMaintenance
}: {
  request: SupportRequest
  onResolve: (id: string, reply: string) => void
  onCreateMaintenance: (request: SupportRequest) => void
}) {
  const isReplied = request.status === 'replied'
  const [replyText, setReplyText] = useState('')

  return (
    <div style={{
      background: 'var(--sp-bg-card)',
      border: '1px solid var(--sp-border-card)',
      borderRadius: 8,
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
            <span style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={12} color="var(--sp-text-muted)" /> {request.email}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Phone size={12} color="var(--sp-text-muted)" /> {request.phone}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {isReplied ? (
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', color: '#16a34a', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={12} /> Đã trả lời
            </span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Chưa trả lời
            </span>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--sp-text-muted)', fontWeight: 500 }}>
            {new Date(request.createdAt).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        background: 'var(--sp-hover-bg)',
        borderRadius: 6,
        border: '1px solid var(--sp-border)',
        fontSize: 13.5, color: 'var(--sp-text-primary)', lineHeight: 1.65,
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
              minHeight: 84, padding: '10px 14px', borderRadius: 6,
              background: 'var(--sp-input-bg)', border: '1px solid var(--sp-border)',
              color: 'var(--sp-text-primary)', fontFamily: F, fontSize: 13.5,
              resize: 'vertical', outline: 'none',
              transition: 'border-color 160ms',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--sp-primary)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--sp-border)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onCreateMaintenance(request)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 6,
                background: 'rgba(245,158,11,0.12)', color: '#d97706',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                transition: 'filter 160ms, transform 160ms'
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
            >
              <Wrench size={14} /> Chuyển Bảo Trì Tại Nhà
            </button>
            <button
              onClick={() => {
                if (!replyText.trim()) return alert('Vui lòng nhập nội dung trả lời!')
                onResolve(request.id, replyText)
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 6,
                background: 'var(--sp-primary)', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                transition: 'filter 160ms, transform 160ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
            >
              <Send size={14} /> Gửi trả lời
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px 16px',
          background: 'var(--sp-primary-bg)',
          borderRadius: 6, border: '1px solid var(--sp-primary-border)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sp-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={13} /> Phản hồi từ Staff
            </div>
            <button
              type="button"
              onClick={() => onCreateMaintenance(request)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6,
                background: 'rgba(245,158,11,0.15)', color: '#d97706',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: F,
              }}
            >
              <Wrench size={12} /> Chuyển Bảo Trì Tại Nhà
            </button>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--sp-text-primary)', lineHeight: 1.6 }}>{request.staffReply}</div>
        </div>
      )}
    </div>
  )
}

// ─── Packing Station Real ───────────────────────────────────────────────────
function PackingStationUI({ onTaskCompleted }: { onTaskCompleted?: () => void }) {
  const [packingTasks, setPackingTasks] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [macInputs, setMacInputs] = useState<Record<string, string>>({})
  const [macErrors, setMacErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPackingTasks()
  }, [])

  const fetchPackingTasks = async () => {
    const userInfoStr = localStorage.getItem('user_info')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
    const userRole = userInfo.role || 'staff'

    const { data } = await supabase
      .from('tasks')
      .select('*, orders(*, order_items(*))')
      .eq('task_type', 'packing')
      .eq('status', 'todo')
      .order('created_at', { ascending: true })

    if (data) {
      const filtered = data.filter((t: any) => {
        if (userRole === 'admin' || userRole === 'staff') return true
        return !t.assigned_to || String(t.assigned_to) === String(userInfo.id)
      })
      setPackingTasks(filtered)
      if (filtered.length > 0 && !selectedTaskId) {
        setSelectedTaskId(filtered[0].id)
      }
    }
  }

  const activeTask = packingTasks.find(t => t.id === selectedTaskId)
  const activeOrder = activeTask?.orders

  const normalizeVer = (ver?: string | null): string => {
    if (!ver) return 'V1'
    const str = String(ver).trim().toUpperCase()
    if (!str) return 'V1'
    const match = str.match(/V(\d+)/i)
    if (match) return `V${match[1]}`
    if (/^\d+$/.test(str)) return `V${str}`
    if (str.includes('PREMIUM')) return 'V4'
    if (str.includes('ADVANCED')) return 'V3'
    if (str.includes('BASIC')) return 'V2'
    if (str.includes('STARTER')) return 'V1'
    return str.startsWith('V') ? str : `V${str}`
  }

  const resolveItemVersion = (item: any): string => {
    if (!item) return 'V1'
    const explicit = item.version || item.product_version || item.firmware_version || item.variant || item.product_variant
    if (explicit) return normalizeVer(explicit)

    const pid = String(item.product_id || '').trim()
    const pidMatch = pid.match(/v?(\d+)/i)
    if (pidMatch && pidMatch[1]) return `V${pidMatch[1]}`

    const name = String(item.product_name || item.name || '').toUpperCase()
    const nameMatch = name.match(/V(\d+)/i)
    if (nameMatch && nameMatch[1]) return `V${nameMatch[1]}`
    if (name.includes('PREMIUM')) return 'V4'
    if (name.includes('ADVANCED')) return 'V3'
    if (name.includes('BASIC')) return 'V2'
    if (name.includes('STARTER')) return 'V1'

    if (item.products?.version) return normalizeVer(item.products.version)
    return 'V1'
  }

  const requiredMacs: { itemId: string, name: string, version: string, index: number }[] = []
  if (activeOrder && activeOrder.order_items) {
    activeOrder.order_items.forEach((item: any) => {
      const verStr = resolveItemVersion(item)
      for (let i = 0; i < item.quantity; i++) {
        requiredMacs.push({
          itemId: item.id,
          name: item.product_name || 'Sản phẩm AquaCare',
          version: verStr,
          index: i
        })
      }
    })
  }

  const handleInputChange = (key: string, value: string) => {
    setMacInputs(prev => ({ ...prev, [key]: value }))
    if (macErrors[key]) {
      setMacErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask || !activeOrder) return

    setMacErrors({})
    const errors: Record<string, string> = {}

    // 1. Check all inputs filled
    requiredMacs.forEach(req => {
      const key = `${req.itemId}_${req.index}`
      const val = macInputs[key]
      if (!val || !val.trim()) {
        errors[key] = 'Vui lòng nhập mã MAC cho thiết bị'
      }
    })

    if (Object.keys(errors).length > 0) {
      setMacErrors(errors)
      return
    }

    // 2. Check duplicate MAC entries within form
    const macCounts: Record<string, string[]> = {}
    requiredMacs.forEach(req => {
      const key = `${req.itemId}_${req.index}`
      const macVal = macInputs[key].trim().toUpperCase()
      if (!macCounts[macVal]) macCounts[macVal] = []
      macCounts[macVal].push(key)
    })

    Object.entries(macCounts).forEach(([macVal, keys]) => {
      if (keys.length > 1) {
        keys.forEach(k => {
          errors[k] = `Mã MAC ${macVal} bị nhập trùng lặp`
        })
      }
    })

    if (Object.keys(errors).length > 0) {
      setMacErrors(errors)
      return
    }

    setIsSubmitting(true)

    // 3. Query DB to validate MAC existence & firmware_version match
    const enteredMacs = requiredMacs.map(req => macInputs[`${req.itemId}_${req.index}`].trim())
    const macList = Array.from(new Set(enteredMacs.flatMap(m => [m, m.toUpperCase(), m.toLowerCase()])))

    const { data: dbDevices, error: devErr } = await supabase
      .from('devices')
      .select('mac_address, firmware_version, is_active, tank_id')
      .in('mac_address', macList)

    if (devErr) {
      console.error("Error checking devices:", devErr)
    }

    const deviceMap = new Map<string, any>()
    if (dbDevices) {
      dbDevices.forEach((d: any) => {
        if (d.mac_address) {
          deviceMap.set(d.mac_address.trim().toUpperCase(), d)
        }
      })
    }

    requiredMacs.forEach(req => {
      const key = `${req.itemId}_${req.index}`
      const macVal = macInputs[key].trim().toUpperCase()
      const reqVer = normalizeVer(req.version)

      const dbDev = deviceMap.get(macVal)
      if (!dbDev) {
        errors[key] = `Mã MAC "${macVal}" không tồn tại trong hệ thống kho`
      } else if (dbDev.is_active || dbDev.tank_id) {
        errors[key] = `Mã MAC "${macVal}" đã được xuất kho / bán cho đơn hàng khác`
      } else {
        const devVer = normalizeVer(dbDev.firmware_version)
        if (devVer !== reqVer) {
          errors[key] = `Mã MAC này thuộc phiên bản ${devVer}, không khớp với sản phẩm (${reqVer})`
        }
      }
    })

    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false)
      setMacErrors(errors)
      return
    }

    // Save to DB & update devices is_active status to true (marked as bought)
    for (const item of activeOrder.order_items) {
      const macsForThisItem = requiredMacs
        .filter(req => req.itemId === item.id)
        .map(req => macInputs[`${req.itemId}_${req.index}`].trim())

      await supabase.from('order_items')
        .update({ device_macs: macsForThisItem })
        .eq('id', item.id)

      if (macsForThisItem.length > 0) {
        const macListToUpdate = macsForThisItem.flatMap(m => [m, m.toUpperCase(), m.toLowerCase()])
        await supabase.from('devices')
          .update({ is_active: true })
          .in('mac_address', macListToUpdate)
      }
    }

    await supabase.from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', activeTask.id)

    await supabase.from('tasks').insert({
      task_type: 'delivery_install',
      order_id: activeOrder.id,
      customer_id: activeOrder.user_id,
      title: `Giao hàng & Lắp đặt Đơn #${activeOrder.id}`,
      description: `Khách hàng: ${activeOrder.shipping_name}\nSĐT: ${activeOrder.shipping_phone}\nĐịa chỉ: ${activeOrder.shipping_address}`,
    })

    setSuccessMsg(`Đã đóng gói xong Đơn #${activeOrder.id}. Đã tạo việc giao hàng!`)
    setMacInputs({})
    setMacErrors({})
    setTimeout(() => setSuccessMsg(''), 4000)

    setIsSubmitting(false)
    fetchPackingTasks()
    if (onTaskCompleted) onTaskCompleted()
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 140px)' }}>
      {/* Left List */}
      <div style={{ width: 320, background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--sp-shadow)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sp-border)', background: 'var(--sp-bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--sp-text-primary)' }}>Chờ đóng gói</span>
          <span style={{ background: 'var(--sp-primary-bg)', color: 'var(--sp-primary)', padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{packingTasks.length} đơn</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {packingTasks.map(t => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedTaskId(t.id)
                setMacInputs({})
                setMacErrors({})
              }}
              style={{
                padding: 14, borderRadius: 6, cursor: 'pointer',
                background: selectedTaskId === t.id ? 'var(--sp-hover-bg)' : 'transparent',
                border: `1px solid ${selectedTaskId === t.id ? 'var(--sp-primary)' : 'var(--sp-border)'}`,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: selectedTaskId === t.id ? 'var(--sp-primary)' : 'var(--sp-text-primary)', fontSize: 13.5 }}>Đơn #{t.order_id}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sp-text-secondary)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.4 }}>
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
      <div style={{ flex: 1, background: 'var(--sp-bg-card)', border: '1px solid var(--sp-border)', borderRadius: 8, padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', position: 'relative', boxShadow: 'var(--sp-shadow)' }}>

        {successMsg && (
          <div style={{ position: 'absolute', top: 20, background: 'rgba(16,185,129,0.15)', color: '#16a34a', padding: '10px 20px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, animation: 'fadeIn 0.3s', zIndex: 10, fontSize: 13.5 }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {!activeTask || !activeOrder ? (
          <div style={{ textAlign: 'center', color: 'var(--sp-text-muted)', margin: 'auto 0' }}>
            <Package size={56} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--sp-text-primary)' }}>Chưa chọn đơn hàng</h2>
            <p style={{ fontSize: 13.5, color: 'var(--sp-text-secondary)' }}>Vui lòng chọn một đơn hàng từ danh sách bên trái để quét mã MAC sản phẩm.</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'var(--sp-hover-bg)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'var(--sp-text-secondary)', marginBottom: 12 }}>
                Đang xử lý đơn hàng <span style={{ color: 'var(--sp-primary)', marginLeft: 4, fontWeight: 700 }}>#{activeOrder.id}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--sp-text-primary)' }}>
                Quét mã MAC thiết bị
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>SẢN PHẨM CẦN LẤY:</div>

              {requiredMacs.map((req, i) => {
                const key = `${req.itemId}_${req.index}`
                const hasError = Boolean(macErrors[key])

                return (
                  <div
                    key={key}
                    style={{
                      background: hasError ? 'rgba(239,68,68,0.06)' : 'var(--sp-hover-bg)',
                      padding: '16px 20px',
                      borderRadius: 8,
                      border: `1.5px solid ${hasError ? '#ef4444' : 'var(--sp-border)'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{req.name} {req.index > 0 ? `(Bản thứ ${req.index + 1})` : ''}</span>
                      <span style={{
                        background: hasError ? 'rgba(239,68,68,0.15)' : 'var(--sp-primary-bg)',
                        color: hasError ? '#ef4444' : 'var(--sp-primary)',
                        border: `1px solid ${hasError ? 'rgba(239,68,68,0.3)' : 'var(--sp-primary-border)'}`,
                        fontSize: 11.5, fontWeight: 700,
                        padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        <Tag size={11} /> Phiên bản: {req.version || 'V1'}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Scan size={18} color={hasError ? '#ef4444' : 'var(--sp-primary)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        required
                        autoFocus={i === 0}
                        type="text"
                        placeholder="Nhập mã MAC..."
                        value={macInputs[key] || ''}
                        onChange={e => handleInputChange(key, e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px 12px 42px', borderRadius: 6, boxSizing: 'border-box',
                          background: 'var(--sp-input-bg)',
                          border: `1.5px solid ${hasError ? '#ef4444' : 'var(--sp-border)'}`,
                          color: 'var(--sp-text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'monospace',
                          outline: 'none', transition: 'all 0.2s',
                          boxShadow: hasError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                        }}
                        onFocus={e => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--sp-primary)' }}
                        onBlur={e => { e.target.style.borderColor = hasError ? '#ef4444' : 'var(--sp-border)' }}
                      />
                    </div>
                    {hasError && (
                      <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <AlertCircle size={13} style={{ flexShrink: 0 }} />
                        {macErrors[key]}
                      </div>
                    )}
                  </div>
                )
              })}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: 8, padding: '14px 20px', background: 'var(--sp-primary)', color: '#fff', border: 'none', borderRadius: 6,
                  fontSize: 14, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1, transition: 'filter 0.2s'
                }}
                onMouseEnter={e => !isSubmitting && (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => !isSubmitting && (e.currentTarget.style.filter = 'brightness(1)')}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đóng gói & Chuyển Giao hàng'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--sp-text-muted)', textAlign: 'center' }}>
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
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null)
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(INITIAL_SUPPORT_REQUESTS)
  const [activeTab, setActiveTab] = useState<'board' | 'packing' | 'history' | 'support'>('board')
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'light'
  )

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dashboard_theme', theme)
  }, [theme])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, orders(*, order_items(*))')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi tải danh sách công việc:', error)
      return
    }

    if (data) {
      const formattedTasks: Task[] = data.map((t: any) => {
        let customerName = t.orders?.shipping_name
        let phone = t.orders?.shipping_phone
        let address = t.orders?.shipping_address

        if (t.description) {
          const lines = t.description.split('\n')
          lines.forEach((line: string) => {
            const trimmed = line.trim()
            const lower = trimmed.toLowerCase()
            if (!customerName && lower.startsWith('khách hàng:')) customerName = trimmed.substring(11).trim()
            if (!phone && (lower.startsWith('sđt:') || lower.startsWith('sdt:'))) phone = trimmed.substring(4).trim()
            if (!address && lower.startsWith('địa chỉ:')) address = trimmed.substring(8).trim()
          })
        }

        let displayType = t.task_type
        if (t.task_type === 'packing') displayType = 'Đóng gói hàng'
        else if (t.task_type === 'delivery_install') displayType = 'Giao hàng & lắp đặt'
        else if (t.task_type === 'maintenance') displayType = 'Bảo trì thiết bị'
        else if (t.task_type === 'support') displayType = 'Hỗ trợ kỹ thuật'

        const orderItems = t.orders?.order_items ? t.orders.order_items.map((item: any) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity || 1,
          product_price: item.product_price || 0,
          device_macs: item.device_macs || []
        })) : []

        const totalAmount = t.orders?.total_amount || t.orders?.total_price || (
          orderItems.reduce((sum: number, item: any) => sum + ((item.quantity || 1) * (item.product_price || 0)), 0)
        )

        const customerOrderNote = t.orders?.note?.trim() || t.orders?.customer_note?.trim() || ''

        return {
          id: String(t.id),
          task_type: t.task_type,
          status: t.status,
          assigned_to: t.assigned_to,
          title: t.title || `Nhiệm vụ #${t.id}`,
          description: t.description,
          staff_note: t.staff_note,
          order_id: t.order_id,
          created_at: t.created_at,
          deadline: t.deadline || t.created_at,
          type: displayType,
          customerName: customerName || 'Khách hàng',
          address: address || 'Chưa có địa chỉ',
          phone: phone || 'N/A',
          note: customerOrderNote,
          orderItems,
          totalAmount
        }
      })
      setTasks(formattedTasks)
    }
  }

  const fetchSupportRequests = async () => {
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Chưa khởi tạo hoặc lỗi kết nối bảng support_requests:', error)
      return
    }

    if (data && data.length > 0) {
      const formatted: SupportRequest[] = data.map((item: any) => ({
        id: String(item.id),
        customerName: item.full_name || 'Khách hàng',
        email: item.email || 'N/A',
        phone: item.phone || 'N/A',
        address: item.address || undefined,
        assigned_to: item.assigned_to || undefined,
        content: item.message || '',
        createdAt: item.created_at,
        status: item.status === 'replied' ? 'replied' : 'pending',
        staffReply: item.staff_reply || undefined,
      }))
      setSupportRequests(formatted)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchSupportRequests()
  }, [])

  const handleLogout = async () => {
    clearVerifiedRole()
    await supabase.auth.signOut()
    localStorage.removeItem('cs_auth')
    localStorage.removeItem('cs_role')
    localStorage.removeItem('user_info')
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const advanceTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const nextStatus: TaskStatus = task.status === 'todo' ? 'in_progress' : 'done'

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: nextStatus } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({
        status: nextStatus,
        ...(nextStatus === 'in_progress' && userInfo?.id ? { assigned_to: userInfo.id } : {}),
        ...(nextStatus === 'done' ? { completed_at: new Date().toISOString() } : {})
      })
      .eq('id', id)

    if (error) {
      console.error('Lỗi khi cập nhật trạng thái công việc:', error)
      fetchTasks()
    } else {
      // Nếu hoàn thành task delivery_install → update orders thành 'delivered'
      if (nextStatus === 'done' && task.task_type === 'delivery_install' && task.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', task.order_id)
      }
      fetchTasks()
    }
  }

  const userRole = userInfo.role || 'staff'

  const handleCreateMaintenanceTask = async (req: SupportRequest) => {
    try {
      let fetchedAddress = (req.address || '').trim()
      if (!fetchedAddress) {
        try {
          const { data: orderData } = await supabase
            .from('orders')
            .select('shipping_address')
            .or(`shipping_phone.eq.${req.phone},shipping_email.eq.${req.email}`)
            .order('created_at', { ascending: false })
            .limit(1)

          if (orderData && orderData.length > 0 && orderData[0].shipping_address) {
            fetchedAddress = orderData[0].shipping_address.trim()
          }
        } catch (err) {
          console.warn('Could not auto-fetch address from orders:', err)
        }
      }

      const finalAddress = fetchedAddress || 'Chưa cung cấp địa chỉ'

      const description = `Khách hàng: ${req.customerName}\nSĐT: ${req.phone}\nEmail: ${req.email}\nĐịa chỉ: ${finalAddress}\n-------------------\nNỘI DUNG THẮC MẮC / CÂU HỎI:\n${req.content}\n-------------------\nPHẢN HỒI CSKH:\n${req.staffReply || 'Cần kiểm tra & bảo trì thiết bị trực tiếp tại nhà'}`

      const payload = {
        task_type: 'maintenance',
        title: `Bảo trì thiết bị tại nhà: ${req.customerName}`,
        description,
        status: 'todo',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('tasks').insert(payload)

      if (error) {
        showToast('Lỗi tạo nhiệm vụ bảo trì: ' + error.message, 'error')
      } else {
        showToast(`Đã chuyển yêu cầu thành task "Bảo trì thiết bị tại nhà" cho Nhân viên Bảo trì thành công!`, 'success')
        fetchTasks()
      }
    } catch (e: any) {
      showToast('Có lỗi xảy ra: ' + e.message, 'error')
    }
  }

  const roleTaskTypes: Record<string, string[]> = {
    staff_warehouse: ['packing'],
    staff_shipper: ['delivery_install', 'Giao hàng & lắp đặt'],
    staff_support: ['support'],
    staff_maintenance: ['maintenance', 'Bảo trì thiết bị'],
    staff: ['packing', 'delivery_install', 'maintenance', 'support', 'Giao hàng & lắp đặt', 'Bảo trì thiết bị'],
  }

  const allowedTaskTypes = roleTaskTypes[userRole] ?? roleTaskTypes['staff']
  const filteredTasks = tasks.filter(t => {
    const isTypeAllowed = allowedTaskTypes.includes(t.task_type) || allowedTaskTypes.includes(t.type || '')
    if (!isTypeAllowed) return false

    if (userRole === 'admin' || userRole === 'staff') return true
    return !t.assigned_to || String(t.assigned_to) === String(userInfo.id)
  })

  const historyTasks = filteredTasks.filter(t => t.status === 'done')
  const todoCount = filteredTasks.filter(t => t.status === 'todo').length
  const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length
  const doneCount = historyTasks.length

  const mySupportRequests = supportRequests.filter(r => {
    if (userRole === 'admin' || userRole === 'staff') return true
    return !r.assigned_to || String(r.assigned_to) === String(userInfo.id)
  })
  const pendingSupportRequests = mySupportRequests.filter(r => r.status === 'pending')
  const repliedSupportRequests = mySupportRequests.filter(r => r.status === 'replied')
  const pendingSupportCount = pendingSupportRequests.length

  const handleResolveSupport = async (id: string, reply: string) => {
    setSupportRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'replied', staffReply: reply } : r))

    const { error } = await supabase
      .from('support_requests')
      .update({
        status: 'replied',
        staff_reply: reply,
      })
      .eq('id', id)

    if (error) {
      console.error('Lỗi cập nhật phản hồi hỗ trợ:', error)
      fetchSupportRequests()
    }
  }

  type TabId = 'board' | 'packing' | 'history' | 'support'

  const ROLE_TAB_MAP: Record<string, TabId[]> = {
    'staff_warehouse': ['packing', 'history'],
    'staff_shipper': ['board', 'history'],
    'staff_support': ['support', 'history'],
    'staff_maintenance': ['board', 'history'],
    'staff': ['board', 'packing', 'support', 'history'],
  }

  const allowedTabs = ROLE_TAB_MAP[userRole] ?? ROLE_TAB_MAP['staff']

  const ALL_TABS: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'board', label: 'Bảng Công Việc', icon: Layout, badge: todoCount + inProgressCount },
    { id: 'packing', label: 'Trạm Đóng Gói', icon: Package },
    { id: 'support', label: 'Yêu Cầu Hỗ Trợ', icon: MessageSquare, badge: pendingSupportCount },
    { id: 'history', label: 'Lịch Sử Làm Việc', icon: History, badge: doneCount },
  ]
  const visibleTabs = ALL_TABS.filter(t => allowedTabs.includes(t.id))

  const ROLE_LABELS: Record<string, string> = {
    staff_warehouse: 'Nhân viên kho',
    staff_shipper: 'Nhân viên giao hàng',
    staff_support: 'Nhân viên hỗ trợ',
    staff_maintenance: 'Nhân viên bảo trì',
    staff: 'Staff',
  }

  useEffect(() => {
    if (!allowedTabs.includes(activeTab as TabId)) {
      setActiveTab(allowedTabs[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sp-bg-main)', fontFamily: F, color: 'var(--sp-text-primary)', display: 'flex', flexDirection: 'column' }}>
      <ThemeStyles theme={theme} />

      {/* ── Topbar: Brand + User info + Actions ── */}
      <header style={{
        background: 'var(--sp-bg-topbar)',
        borderBottom: '1px solid var(--sp-border)',
        boxShadow: 'none',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          {/* Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--sp-primary)', letterSpacing: '-0.02em' }}>
              AquaCare
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--sp-text-muted)' }}>
              | Staff Portal ({ROLE_LABELS[userRole] || 'Staff'})
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', overflowX: 'auto' }}>
            {visibleTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: '100%', padding: '0 14px', border: 'none', cursor: 'pointer',
                    fontFamily: F, fontSize: 13, fontWeight: isActive ? 700 : 500,
                    background: 'transparent',
                    color: isActive ? 'var(--sp-primary)' : 'var(--sp-text-secondary)',
                    borderBottom: isActive ? '2px solid var(--sp-primary)' : '2px solid transparent',
                    transition: 'all 160ms', position: 'relative', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--sp-text-primary)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 100,
                      background: 'var(--sp-primary)',
                      color: '#fff',
                      fontSize: 10, fontWeight: 700, lineHeight: 1.2
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {/* User Avatar Initials + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)', flexShrink: 0
              }}>
                {getInitialsAvatar(userInfo.full_name || userInfo.name || 'Staff')}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
                {userInfo.full_name || 'Nhân viên'}
              </span>
            </div>

            {/* Theme Switcher (Inner Moon Animated) */}
            <InnerMoonToggle
              toggled={theme === 'dark'}
              onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              borderColorVar="var(--sp-border)"
              bgCardVar="var(--sp-bg-card)"
              hoverBgVar="var(--sp-hover-bg)"
              textColorVar="var(--sp-text-secondary)"
            />

            {/* Home Link */}
            <Link to="/" title="Về trang chủ" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 6, border: '1px solid var(--sp-border)',
              background: 'var(--sp-bg-card)', color: 'var(--sp-text-secondary)', textDecoration: 'none',
              transition: 'all 180ms'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)'; e.currentTarget.style.color = 'var(--sp-text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--sp-bg-card)'; e.currentTarget.style.color = 'var(--sp-text-secondary)' }}
            >
              <ArrowLeft size={15} />
            </Link>

            {/* Red Tinted Logout Button */}
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
      <main style={{ flex: 1, maxWidth: 1320, width: '100%', margin: '0 auto', padding: '20px 24px 40px', boxSizing: 'border-box' }}>

        {activeTab === 'board' && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: 'calc(100vh - 160px)' }}>
            {(['todo', 'in_progress'] as TaskStatus[]).map(colKey => (
              <KanbanColumn
                key={colKey}
                colKey={colKey}
                tasks={filteredTasks.filter(t => t.status === colKey)}
                onAdvance={advanceTask}
              />
            ))}
          </div>
        )}

        {activeTab === 'packing' && <PackingStationUI onTaskCompleted={fetchTasks} />}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Task History Section */}
            <div style={{
              background: 'var(--sp-bg-card)',
              borderRadius: 8, border: '1px solid var(--sp-border)',
              overflow: 'hidden', boxShadow: 'var(--sp-shadow)'
            }}>
              <div style={{
                padding: '12px 20px',
                background: 'var(--sp-bg-history-header)',
                borderBottom: '1px solid var(--sp-border)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <History size={14} color="#16a34a" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)' }}>Lịch sử công việc</span>
                <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>({historyTasks.length} công việc hoàn thành)</span>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 140px 120px 120px',
                padding: '12px 20px', gap: 12,
                background: 'var(--sp-bg-history-header)',
                borderBottom: '1px solid var(--sp-border)',
              }}>
                {['Công việc', 'Loại', 'Ngày hạn', 'Trạng thái', 'Thao tác'].map((h, i) => (
                  <span key={h} style={{ fontSize: 12, fontWeight: 700, color: 'var(--sp-text-primary)', textTransform: 'uppercase', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
                ))}
              </div>

              {historyTasks.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <History size={32} color="#16a34a" style={{ opacity: 0.2 }} />
                  <p style={{ margin: 0, color: 'var(--sp-text-muted)', fontSize: 13.5 }}>Chưa có công việc nào hoàn thành</p>
                </div>
              ) : (
                historyTasks.map(task => <HistoryRow key={task.id} task={task} onViewDetails={setSelectedDetailTask} />)
              )}
            </div>

            {/* Replied Support Requests Section - only for support roles */}
            {(userRole === 'staff_support' || userRole === 'staff') && repliedSupportRequests.length > 0 && (
              <div style={{
                background: 'var(--sp-bg-card)',
                borderRadius: 8, border: '1px solid var(--sp-border)',
                overflow: 'hidden', boxShadow: 'var(--sp-shadow)'
              }}>
                <div style={{
                  padding: '14px 20px',
                  background: 'var(--sp-bg-history-header)',
                  borderBottom: '1px solid var(--sp-border)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <CheckCircle size={14} color="#16a34a" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-text-primary)' }}>Yêu cầu hỗ trợ đã trả lời</span>
                  <span style={{ fontSize: 12, color: 'var(--sp-text-muted)' }}>({repliedSupportRequests.length} yêu cầu)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {repliedSupportRequests.map(req => (
                    <div key={req.id} style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--sp-border)',
                      display: 'flex', flexDirection: 'column', gap: 10,
                      transition: 'background 140ms'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--sp-hover-bg)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)', marginBottom: 4 }}>{req.customerName}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--sp-text-secondary)' }}>
                            <span>{req.email}</span>
                            <span>•</span>
                            <span>{req.phone}</span>
                            <span>•</span>
                            <span>{new Date(req.createdAt).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
                          background: 'rgba(16,185,129,0.1)', color: '#16a34a', border: '1px solid rgba(16,185,129,0.25)',
                          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                          <CheckCircle size={11} /> Đã trả lời
                        </span>
                      </div>
                      <div style={{
                        padding: '10px 14px', borderRadius: 6,
                        background: 'var(--sp-hover-bg)', border: '1px solid var(--sp-border)',
                        fontSize: 13, color: 'var(--sp-text-secondary)', lineHeight: 1.5
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--sp-text-primary)', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Câu hỏi:</span>
                        {req.content}
                      </div>
                      {req.staffReply && (
                        <div style={{
                          padding: '10px 14px', borderRadius: 6,
                          background: 'var(--sp-primary-bg)', border: '1px solid var(--sp-primary-border)',
                          fontSize: 13, color: 'var(--sp-text-primary)', lineHeight: 1.5
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--sp-primary)', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Phản hồi của staff:</span>
                          {req.staffReply}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleCreateMaintenanceTask(req)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px', borderRadius: 6,
                            background: 'rgba(245,158,11,0.12)', color: '#d97706',
                            border: '1px solid rgba(245,158,11,0.3)',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                            transition: 'filter 160ms'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                        >
                          <Wrench size={13} /> Chuyển Bảo Trì Tại Nhà
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 860, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={16} color="var(--sp-primary)" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-text-primary)' }}>
                  Yêu cầu chưa được trả lời
                </span>
                {pendingSupportCount > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 100,
                    background: 'rgba(245,158,11,0.15)', color: '#d97706',
                    border: '1px solid rgba(245,158,11,0.3)',
                    fontSize: 11, fontWeight: 700
                  }}>
                    {pendingSupportCount} chờ xử lý
                  </span>
                )}
              </div>
            </div>

            {pendingSupportRequests.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'var(--sp-bg-card)', borderRadius: 8, border: '1px solid var(--sp-border)' }}>
                <MessageSquare size={32} color="var(--sp-primary)" style={{ opacity: 0.2 }} />
                <p style={{ margin: 0, color: 'var(--sp-text-muted)', fontSize: 13.5 }}>Không có yêu cầu hỗ trợ nào chưa xử lý</p>
                <p style={{ margin: 0, color: 'var(--sp-text-muted)', fontSize: 12 }}>Các yêu cầu đã trả lời nằm trong tab Lịch Sử Làm Việc</p>
              </div>
            ) : (
              pendingSupportRequests.map(req => (
                <SupportCard
                  key={req.id}
                  request={req}
                  onResolve={handleResolveSupport}
                  onCreateMaintenance={handleCreateMaintenanceTask}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Details Modal ── */}
      {selectedDetailTask && (
        <TaskDetailsModal
          task={selectedDetailTask}
          onClose={() => setSelectedDetailTask(null)}
        />
      )}

      {/* ── Top-Center Toast Notification (Admin Style) ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff', padding: '10px 24px', borderRadius: 8,
          fontSize: 13.5, fontWeight: 600, fontFamily: F,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
          pointerEvents: 'none'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
