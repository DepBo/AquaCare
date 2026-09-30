import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const hasHash = !!(location.hash || (location.state as any)?.scrollTo)

    if (hasHash) {
      // Khi có hash mục tiêu (ví dụ #contact), không reset cuộn về đầu trang (0,0)
      // và tạm tắt animation 3D transform để không làm lệch tọa độ cuộn
      setIsAnimating(false)
    } else {
      // Chuyển trang bình thường không có hash: cuộn về đầu trang và kích hoạt hiệu ứng
      setIsAnimating(true)
      window.scrollTo(0, 0)
      const t = setTimeout(() => setIsAnimating(false), 700)
      return () => clearTimeout(t)
    }
  }, [location.pathname, location.hash, location.state])

  return (
    <div
      style={{
        animation: isAnimating
          ? 'pageSlideIn 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          : 'none',
        willChange: isAnimating ? 'transform, opacity, filter' : 'auto',
      }}
    >
      {children}
    </div>
  )
}
