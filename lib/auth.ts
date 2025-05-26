import { jwtVerify, SignJWT } from 'jose'

export interface AdminUser {
  id: string
  email: string
  role: 'ADMIN'
}

// In a real app, you would use a secure environment variable
const JWT_SECRET = new TextEncoder().encode('your-secret-key')

export async function signToken(payload: AdminUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Verify that the payload has the required AdminUser properties
    if (
      typeof payload.id === 'string' &&
      typeof payload.email === 'string' &&
      payload.role === 'ADMIN'
    ) {
      return payload as unknown as AdminUser
    }
    
    return null
  } catch (error) {
    return null
  }
}

export async function isAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false
  
  const user = await verifyToken(token)
  return user?.role === 'ADMIN'
}
