'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewLiveClassPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ title: '', description: '', streamUrl: '', scheduledAt: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('live_classes').insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      stream_provider: 'youtube',
      stream_url: form.streamUrl.trim(),
      scheduled_at: form.scheduledAt || null,
      is_live: false,
      created_by: user?.id,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/admin/live')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة حصة بث مباشر</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الحصة</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رابط يوتيوب لايف (خدي رابط الفيديو العادي، هنحوّله تلقائيًا لصيغة العرض)
            </label>
            <input
              type="text"
              required
              value={form.streamUrl}
              onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.youtube.com/watch?v=xxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">معاد الحصة (اختياري)</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الحصة'}
          </button>
        </form>
      </div>
    </div>
  )
}