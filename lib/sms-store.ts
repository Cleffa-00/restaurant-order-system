// lib/sms-store.ts
interface SmsCodeData {
    code: string
    expires: number
  }
  
  // 在生产环境中，应该使用 Redis 或数据库
  class SmsCodeStore {
    private store = new Map<string, SmsCodeData>()
  
    set(phone: string, data: SmsCodeData) {
      this.store.set(phone, data)
    }
  
    get(phone: string): SmsCodeData | undefined {
      return this.store.get(phone)
    }
  
    delete(phone: string): boolean {
      return this.store.delete(phone)
    }
  
    // 清理过期的验证码
    cleanup() {
      const now = Date.now()
      for (const [phone, data] of this.store.entries()) {
        if (now > data.expires) {
          this.store.delete(phone)
        }
      }
    }
  }
  
  export const smsCodeStore = new SmsCodeStore()
  
  // 每分钟清理一次过期的验证码
  setInterval(() => {
    smsCodeStore.cleanup()
  }, 60 * 1000)