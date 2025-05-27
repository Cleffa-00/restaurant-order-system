// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose'
import { JwtPayload, Role } from '@/types'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// 使用 Web Crypto API 替代 bcryptjs
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export async function signToken(payload: Omit<JwtPayload, 'exp' | 'iat'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (
      typeof payload.userId === 'string' &&
      typeof payload.phone === 'string' &&
      (payload.role === Role.ADMIN || payload.role === Role.USER)
    ) {
      return payload as unknown as JwtPayload
    }
    
    return null
  } catch (error) {
    return null
  }
}

export async function isAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false
  
  const user = await verifyToken(token)
  return user?.role === Role.ADMIN
}