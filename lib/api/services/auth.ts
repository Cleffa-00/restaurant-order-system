// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose'
import { JwtPayload, Role, AccessTokenPayload, RefreshTokenPayload, TokenPair } from '@/types'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// 使用 Web Crypto API 进行密码哈希
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  
  // 添加盐值
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltedPassword = new Uint8Array(data.length + salt.length)
  saltedPassword.set(data)
  saltedPassword.set(salt, data.length)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const saltArray = Array.from(salt)
  
  // 将盐值和哈希值组合
  const combined = [...saltArray, ...hashArray]
  return combined.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // 提取盐值和哈希值
    const hashBytes = []
    for (let i = 0; i < storedHash.length; i += 2) {
      hashBytes.push(parseInt(storedHash.substr(i, 2), 16))
    }
    
    const salt = new Uint8Array(hashBytes.slice(0, 16))
    const originalHash = hashBytes.slice(16)
    
    // 重新计算哈希值
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const saltedPassword = new Uint8Array(data.length + salt.length)
    saltedPassword.set(data)
    saltedPassword.set(salt, data.length)
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword)
    const newHash = Array.from(new Uint8Array(hashBuffer))
    
    // 比较哈希值
    return newHash.length === originalHash.length && 
           newHash.every((byte, index) => byte === originalHash[index])
  } catch (error) {
    return false
  }
}

// 生成Access Token (短期，15分钟)
export async function signAccessToken(payload: Omit<AccessTokenPayload, 'exp' | 'iat' | 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
}

// 生成Refresh Token (长期，7天)
export async function signRefreshToken(payload: Omit<RefreshTokenPayload, 'exp' | 'iat' | 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// 🆕 单独生成 Access Token 的函数（用于 refresh 场景）
export async function generateAccessToken(userPayload: { userId: string; phone: string; role: Role }): Promise<string> {
  return signAccessToken(userPayload)
}

// 生成Token对
export async function generateTokenPair(userPayload: { userId: string; phone: string; role: Role }): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userPayload),
    signRefreshToken({ userId: userPayload.userId, phone: userPayload.phone })
  ])

  return { accessToken, refreshToken }
}

// 验证Access Token
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (
      payload.type === 'access' &&
      typeof payload.userId === 'string' &&
      typeof payload.phone === 'string' &&
      (payload.role === Role.ADMIN || payload.role === Role.USER)
    ) {
      return payload as unknown as AccessTokenPayload
    }
    
    return null
  } catch (error) {
    return null
  }
}

// 验证Refresh Token
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (
      payload.type === 'refresh' &&
      typeof payload.userId === 'string' &&
      typeof payload.phone === 'string'
    ) {
      return payload as unknown as RefreshTokenPayload
    }
    
    return null
  } catch (error) {
    return null
  }
}

// 兼容旧版本的验证函数
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  // 首先尝试作为Access Token验证
  const accessPayload = await verifyAccessToken(token)
  if (accessPayload) {
    return {
      userId: accessPayload.userId,
      phone: accessPayload.phone,
      role: accessPayload.role,
      exp: accessPayload.exp,
      iat: accessPayload.iat
    }
  }
  
  return null
}

export async function isAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false
  
  const payload = await verifyAccessToken(token)
  return payload?.role === Role.ADMIN
}