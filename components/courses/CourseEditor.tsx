'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; title: string; description: string | null; price: number; cover_image_url: string | null; is_published: boolean }

export default function CourseEditor({ course }: { course: Course }) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: course.title, description: course.description ?? '', price: String(course.price), coverImageUrl: course.cover_image_url ?? '', isPublished: course.is_published })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.from('courses').update({ title: form.title.trim(), description: form.description.trim() || null, price: Number(form.price) || 0, cover_image_url: form.coverImageUrl.trim() || null, is_published: form.isPublished }).eq('id', course.id)
    setLoading(false)
    if (updateError) return setError(updateError.message)
    router.push('/admin/courses')
    router.refresh()
  }

  return <form onSubmit={save} className="space-y-4" dir="rtl">
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="عنوان الكورس" />
    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" rows={5} placeholder="وصف الكورس" />
    <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="السعر" />
    <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="رابط صورة الغلاف" dir="ltr" />
    <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> الكورس منشور للطلاب</label>
    <button disabled={loading} className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button>
  </form>
}
