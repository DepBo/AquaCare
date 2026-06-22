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
    // Trigger enter animation on every route change
    setIsAnimating(true)
    window.scrollTo(0, 0)
    const t = setTimeout(() => setIsAnimating(false), 700)
    return () => clearTimeout(t)
  }, [location.pathname])

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
