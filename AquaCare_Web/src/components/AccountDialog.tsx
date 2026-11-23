import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CircleCheck, CircleAlert, Camera, Eye, EyeOff, LockKeyhole, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import './AccountDialog.css'

interface AccountUser {
  full_name?: string
  email?: string
  avatar_url?: string
}
interface Props {
  supabase: SupabaseClient
  user: AccountUser
  onAvatarChange: () => void
  onSaved: (name: string) => void
  onClose: () => void
}

export default function AccountDialog({ supabase, user, onAvatarChange, onSaved, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState('profile')
  const [name, setName] = useState(user.full_name || '')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    dialog.current?.showModal()
    return () => dialog.current?.close()
  }, [])

  function changeTab(value: string) {
    setTab(value)
    setError('')
    setMessage('')
    setPasswords({ current: '', next: '', confirm: '' })
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setError('')
    setMessage('')
    const trimmed = name.trim()
    if (tab === 'profile' && (!trimmed || trimmed.length > 100)) {
      setError('Tên hiển thị cần từ 1 đến 100 ký tự.')
      return
    }
    if (tab === 'security') {
      if (passwords.next.length < 6) { setError('Mật khẩu mới cần ít nhất 6 ký tự.'); return }
      if (passwords.next !== passwords.confirm) { setError('Mật khẩu xác nhận không khớp.'); return }
      if (passwords.next === passwords.current) { setError('Mật khẩu mới cần khác mật khẩu hiện tại.'); return }
    }
    setBusy(true)
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError || !data.user) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      if (tab === 'profile') {
        const { data: saved, error: saveError } = await supabase.from('users')
          .update({ full_name: trimmed }).eq('id', data.user.id).select('full_name').single()
        if (saveError) throw saveError
        onSaved(saved.full_name)
        // public.users is the canonical profile used by login and the dashboard.
        setMessage('Đã cập nhật thông tin')
      } else {
        if (!data.user.email) throw new Error('Không xác định được email tài khoản.')
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: data.user.email, password: passwords.current,
        })
        if (verifyError) throw new Error('Không xác thực được mật khẩu hiện tại. Nếu đăng nhập bằng Google, bạn có thể dùng Quên mật khẩu để thiết lập mật khẩu.')
        const { error: passwordError } = await supabase.auth.updateUser({ password: passwords.next })
        if (passwordError) throw passwordError
        setPasswords({ current: '', next: '', confirm: '' })
        setMessage('Đã đổi mật khẩu thành công.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không lưu được thay đổi. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialog} className="account-dialog" aria-labelledby="account-title"
      onCancel={event => { if (busy) event.preventDefault(); else onClose() }}>
      <header>
        <h2 id="account-title">Tài khoản</h2>
        <button type="button" className="account-icon" aria-label="Đóng tài khoản" disabled={busy} onClick={onClose}><X size={20} /></button>
      </header>
      <div className="account-tabs" role="tablist" aria-label="Cài đặt tài khoản">
        <button id="profile-tab" type="button" role="tab" aria-selected={tab === 'profile'} aria-controls="account-panel" disabled={busy} onClick={() => changeTab('profile')}><UserRound size={17} />Thông tin cá nhân</button>
        <button id="security-tab" type="button" role="tab" aria-selected={tab === 'security'} aria-controls="account-panel" disabled={busy} onClick={() => changeTab('security')}><LockKeyhole size={17} />Bảo mật</button>
      </div>
      <form onSubmit={save} id="account-panel" role="tabpanel" aria-labelledby={tab === 'profile' ? 'profile-tab' : 'security-tab'}>
        <fieldset disabled={busy}>
          {tab === 'profile' ? <>
            <div className="account-identity">
              <button type="button" className="account-avatar" onClick={onAvatarChange} aria-label="Đổi ảnh đại diện" title="Đổi ảnh đại diện">
              {user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{(name.trim() || 'A').slice(0, 1).toLocaleUpperCase('vi')}</span>}
              <span className="account-avatar-camera"><Camera size={23} /></span></button>
              <div><strong>{user.full_name || 'Người dùng AquaCare'}</strong><small>{user.email}</small></div>
            </div>
            <label htmlFor="account-name">Tên hiển thị</label>
            <input id="account-name" value={name} maxLength={100} autoComplete="name" required onChange={event => { setName(event.target.value); setMessage('') }} />
            <label htmlFor="account-email">Email</label>
            <input id="account-email" value={user.email || ''} readOnly className="account-readonly" />
          </> : <>
            <p className="account-intro">Cập nhật mật khẩu cho tài khoản của bạn.</p>
            {([
              ['current', 'Mật khẩu hiện tại', 'current-password'],
              ['next', 'Mật khẩu mới', 'new-password'],
              ['confirm', 'Xác nhận mật khẩu mới', 'new-password'],
            ] as const).map(([key, label, autocomplete]) => <div key={key}>
              <label htmlFor={'account-' + key}>{label}</label>
              <div className="account-password">
                <input id={'account-' + key} type={visible[key] ? 'text' : 'password'} autoComplete={autocomplete}
                  value={passwords[key]} required onChange={event => { setPasswords({ ...passwords, [key]: event.target.value }); setMessage('') }} />
                <button type="button" className="account-icon" aria-label={(visible[key] ? 'Ẩn ' : 'Hiện ') + label.toLocaleLowerCase('vi')} onClick={() => setVisible({ ...visible, [key]: !visible[key] })}>
                  {visible[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {key === 'current' && <Link to="/forgot-password" onClick={event => { if (busy) event.preventDefault(); else onClose() }} aria-disabled={busy} className="account-forgot">Quên mật khẩu?</Link>}
              {key === 'next' && <small className="account-hint">Ít nhất 6 ký tự.</small>}
            </div>)}
          </>}
        </fieldset>
        {error && <p className="account-error" role="alert"><CircleAlert size={20} aria-hidden="true" /><span>{error}</span></p>}
        {message && <p className="account-success" role="status"><CircleCheck size={20} aria-hidden="true" /><span>{message}</span></p>}
        <footer>
          <button type="button" className="account-cancel" disabled={busy} onClick={onClose}>Hủy</button>
          <button type="submit" className="account-save" disabled={busy}>{busy ? 'Đang lưu…' : tab === 'profile' ? 'Lưu thay đổi' : 'Lưu mật khẩu'}</button>
        </footer>
      </form>
    </dialog>
  )
}
