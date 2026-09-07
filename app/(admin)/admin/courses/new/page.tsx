'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/uploadImage'

export default function NewCoursePage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('لازم تكون مسجل دخول.')
      setLoading(false)
      return
    }

    let coverImageUrl: string | null = null
    if (coverFile) {
      coverImageUrl = await uploadImage(coverFile, 'course-covers','covers')
      if (!coverImageUrl) {
        setError('حصل خطأ أثناء رفع صورة الغلاف.')
        setLoading(false)
        return
      }
    }

    const { error: insertError } = await supabase.from('courses').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      cover_image_url: coverImageUrl,
      is_published: true,
      created_by: user.id,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/admin/courses')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة كورس جديد</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الكورس</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="مثال: أساسيات التحكم الآلي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (جنيه)</label>
            <input
              type="number"
              step="50"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">صورة غلاف الكورس</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الكورس'}
          </button>
        </form>
      </div>
    </div>
  )
}