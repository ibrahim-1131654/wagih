import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Quiz = {
  id: string
  title: string
  time_limit_minutes: number | null
  is_published: boolean
  courses: { title: string } | null
}

export default async function AdminQuizzesPage() {
  const supabase = await createClient()

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, courses:course_id ( title )')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">الاختبارات</h1>
          <Link
            href="/admin/quizzes/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + إنشاء اختبار
          </Link>
        </div>

        {(!quizzes || quizzes.length === 0) && (
          <p className="text-gray-500 text-sm">لسه مفيش اختبارات. ابدأ بإنشاء واحد.</p>
        )}

        <div className="space-y-3">
          {quizzes?.map((quiz: Quiz) => (
            <Link
              key={quiz.id}
              href={`/admin/quizzes/${quiz.id}/edit`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{quiz.title}</p>
                  <p className="text-sm text-gray-500">
                    {quiz.courses?.title || 'بدون كورس'}
                    {quiz.time_limit_minutes ? ` • ${quiz.time_limit_minutes} دقيقة` : ''}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    quiz.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {quiz.is_published ? 'منشور' : 'مسودة'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
