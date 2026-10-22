import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const previousTitle = document.title
    document.title = '404 · Không tìm thấy trang | AquaCare'
    return () => { document.title = previousTitle }
  }, [])

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <main className="not-found-page">
      <Link className="not-found-page__brand" to="/" aria-label="Về trang chủ AquaCare">
        <img src="/logo_ngang.png" alt="AquaCare" />
      </Link>

      <div className="not-found-page__content">
        <div className="not-found-page__art" role="img" aria-label="Số 404 với bể cá ở giữa">
          <img src="/images/not-found-illustration.png" alt="" />
        </div>

        <h1>Ối! Bạn đã bơi lạc rồi.</h1>
        <p>Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>

        <div className="not-found-page__actions">
          <Link className="not-found-page__primary" to="/">Về trang chủ</Link>
          <button className="not-found-page__secondary" type="button" onClick={goBack}>Quay lại</button>
        </div>
      </div>
    </main>
  )
}
