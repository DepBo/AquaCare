// Vite proxies /api to the local Express server in development.
// Production builds keep the configured Render API origin.
export const API_URL = (import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'https://aquacare-p78r.onrender.com')).replace(/\/+$/, '')
