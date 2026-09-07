'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LiveSessionToggle({ sessionId, isLive }: { sessionId: string; isLive: boolean }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  async function toggle() {
    setLoading(true)
    await supabase.from('live_sessions').update({ is_live: !isLive }).eq('id', sessionId)
    setLoading(false)
    router.refresh()
  }
  return <button onClick={toggle} disabled={loading} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${isLive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>{loading ? 'جارٍ الحفظ...' : isLive ? 'إنهاء البث' : 'إعادة تشغيل البث'}</button>
}
