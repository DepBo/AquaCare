import { useState } from 'react'
import { ArrowUpRight, ChevronRight, Pencil } from 'lucide-react'
import './FeedbackButton.css'

const feedbackUrl = 'https://forms.gle/mKFwk4N73y5SxCTj9'

export default function FeedbackButton() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`feedback-entry${collapsed ? ' feedback-entry--collapsed' : ''}`}    >
      <a className="feedback-entry__link" href={feedbackUrl} target="_blank" rel="noopener noreferrer"
        aria-label="Mở form góp ý AquaCare" title="Mở form góp ý">
        <span className="feedback-entry__icon"><Pencil size={19} strokeWidth={2.4} /></span>
        {!collapsed && <span className="feedback-entry__copy"><strong>Chia sẻ góp ý</strong><small>Giúp AquaCare tốt hơn</small></span>}
      </a>
      <button type="button" className="feedback-entry__toggle"
        onClick={() => setCollapsed(value => !value)}
        aria-label={collapsed ? 'Mở rộng nút góp ý' : 'Thu nhỏ nút góp ý'}
        title={collapsed ? 'Mở rộng' : 'Thu nhỏ'}>
        {collapsed ? <ChevronRight size={18} /> : <ArrowUpRight size={19} />}
      </button>
    </div>
  )
}
