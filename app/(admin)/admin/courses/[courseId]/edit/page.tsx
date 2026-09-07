import Link from 'next/link'
import { notFound } from 'next/navigation'
import CourseEditor from '@/components/courses/CourseEditor'
import { createClient } from '@/lib/supabase/server'

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: course } = await supabase.from('courses').select('id, title, description, price, cover_image_url, is_published').eq('id', courseId).single()
  if (!course) notFound()
  return <main className="min-h-screen bg-gray-50 p-8" dir="rtl"><div className="max-w-xl mx-auto"><Link href="/admin/courses" className="mb-5 inline-block text-sm text-indigo-600">→ رجوع للكورسات</Link><section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"><h1 className="mb-6 text-2xl font-semibold text-gray-900">تعديل الكورس</h1><CourseEditor course={course} /></section></div></main>
}
