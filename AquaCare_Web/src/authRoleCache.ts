type VerifiedRole = { userId: string; role: string }

let verifiedRole: VerifiedRole | null = null

export const getVerifiedRole = () => verifiedRole

export const rememberVerifiedRole = (userId: string, role: string) => {
  verifiedRole = { userId, role }
}

export const clearVerifiedRole = () => {
  verifiedRole = null
}
