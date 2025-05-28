import { NextRequest } from "next/server"

export async function validateCSRF(request: NextRequest): Promise<boolean> {
    const method = request.method
    
    // GET 请求不需要 CSRF 验证
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true
    }
    
    // 获取 CSRF tokens
    const csrfHeader = request.headers.get('x-csrf-token')
    const csrfCookie = request.cookies.get('csrfToken')?.value
    
    // 验证 CSRF token
    return csrfHeader === csrfCookie && !!csrfHeader
  }