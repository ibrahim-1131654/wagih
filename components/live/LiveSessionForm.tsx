'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; title: string }

export default function LiveSessionForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [courseId, setCourseId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!title.trim() || !youtubeUrl.trim()) {
      setError('اكتب عنوان البث ورابط YouTube Live.')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: insertError } = await supabase.from('live_sessions').insert({
      title: title.trim(),
      youtube_url: youtubeUrl.trim(),
      course_id: courseId || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      is_live: true,
      created_by: user?.id,
    })
    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setTitle('')
    setYoutubeUrl('')
    setCourseId('')
    setStartsAt('')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4" dir="rtl">
      <h2 className="font-semibold text-gray-900">بدء بث مباشر جديد</h2>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان البث" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} dir="ltr" placeholder="رابط YouTube Live أو رابط الفيديو" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left" />
      <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
        <option value="">بث عام لكل الطلاب</option>
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <input value={startsAt} onChange={(event) => setStartsAt(event.target.value)} type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      <button disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{loading ? 'جارٍ البدء...' : 'بدء البث للطلاب'}</button>
    </form>
  )
}
