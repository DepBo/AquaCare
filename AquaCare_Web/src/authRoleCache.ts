type VerifiedRole = { userId: string; role: string }

let verifiedRole: VerifiedRole | null = null

export const getVerifiedRole = () => verifiedRole

export const rememberVerifiedRole = (userId: string, role: string) => {
  verifiedRole = { userId, role }
}

export const clearVerifiedRole = () => {
  verifiedRole = null
}

export const clearLocalAuthSession = () => {
  clearVerifiedRole()
  localStorage.removeItem('cs_auth')
  localStorage.removeItem('cs_role')
  localStorage.removeItem('user_info')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.dispatchEvent(new Event('aquacare:auth-changed'))
}

