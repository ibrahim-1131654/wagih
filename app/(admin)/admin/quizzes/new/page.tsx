'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewQuizPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimitMinutes: '',
    courseId: '',
  })
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadCourses() {
    const { data } = await supabase.from('courses').select('id, title').order('title')
    setCourses(data || [])
  }

  // نجيب قايمة الكورسات أول ما الصفحة تفتح
  useState(() => {
    loadCourses()
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('لازم تكوني مسجلة دخول.')
      setLoading(false)
      return
    }

    const { data: quiz, error: insertError } = await supabase
      .from('quizzes')
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        time_limit_minutes: form.timeLimitMinutes ? parseInt(form.timeLimitMinutes) : null,
        course_id: form.courseId || null,
        is_published: false, // هيتنشر بعد ما نضيف الأسئلة
        created_by: user.id,
      })
      .select()
      .single()

    setLoading(false)

    if (insertError || !quiz) {
      setError(insertError?.message || 'حصل خطأ.')
      return
    }

    // نروح على طول لصفحة إضافة الأسئلة للاختبار اللي اتعمل
    router.push(`/admin/quizzes/${quiz.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إنشاء اختبار جديد</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الاختبار</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="مثال: اختبار الوحدة الأولى - دوائر التحكم"
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
              الكورس المرتبط (اختياري)
            </label>
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— بدون كورس (اختبار مستقل) —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مدة الاختبار بالدقايق (اختياري)
            </label>
            <input
              type="number"
              step="5"
              value={form.timeLimitMinutes}
              onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="مثال: 30 (سيبيها فاضية لو مفيش وقت محدد)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الاختبار وإضافة الأسئلة'}
          </button>
        </form>
      </div>
    </div>
  )
}