import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function StudentQuizzesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscriptions } = await supabase
    .from('course_subscriptions')
    .select('course_id')
    .eq('student_id', user?.id)
    .eq('status', 'active')

  const subscribedCourseIds = subscriptions?.map((s) => s.course_id) || []

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, courses:course_id ( title )')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const availableQuizzes = quizzes?.filter(
    (q) => !q.course_id || subscribedCourseIds.includes(q.course_id)
  )

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, score, total_points, submitted_at')
    .eq('student_id', user?.id)

  function getAttempt(quizId: string) {
    return attempts?.find((a) => a.quiz_id === quizId && a.submitted_at)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">الاختبارات المتاحة</h1>
        <p className="text-sm text-gray-500 mb-6">اختبري نفسك وشوفي نتيجتك فورًا</p>

        {(!availableQuizzes || availableQuizzes.length === 0) && (
          <p className="text-gray-500 text-sm">لا يوجد اختبارات متاحة لك حاليًا.</p>
        )}

        <div className="space-y-3">
          {availableQuizzes?.map((quiz: any) => {
            const attempt = getAttempt(quiz.id)
            return (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    <p className="text-sm text-gray-500">
                      {quiz.courses?.title || 'اختبار عام'}
                      {quiz.time_limit_minutes ? ` • ${quiz.time_limit_minutes} دقيقة` : ''}
                    </p>
                  </div>
                  {attempt ? (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                      {attempt.score}/{attempt.total_points}
                    </span>
                  ) : (
                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">
                      ابدأ الاختبار
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}