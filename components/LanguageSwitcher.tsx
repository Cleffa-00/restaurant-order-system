'use client'

import { useRouter, usePathname } from 'next/navigation'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (lang: 'en' | 'zh') => {
    const path = pathname.replace(/^\/\w{2}/, `/${lang}`)
    router.push(path)
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => switchTo('zh')} className="px-3 py-1 rounded-md hover:bg-gray-100">
        中文
      </button>
      <button onClick={() => switchTo('en')} className="px-3 py-1 rounded-md hover:bg-gray-100">
        English
      </button>
    </div>
  )
} 