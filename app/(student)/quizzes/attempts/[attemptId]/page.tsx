import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function QuizResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('id, score, total_points, submitted_at, quizzes:quiz_id ( title )')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()
  if (!attempt) notFound()

  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('id, is_correct, points_awarded, quiz_questions:question_id ( question_text )')
    .eq('attempt_id', attempt.id)
  const typedAttempt = attempt as unknown as { id: string; score: number; total_points: number; quizzes: { title: string } | null }
  const typedAnswers = (answers ?? []) as unknown as Array<{ id: string; is_correct: boolean; points_awarded: number; quiz_questions: { question_text: string } | null }>
  const percentage = typedAttempt.total_points > 0 ? Math.round((typedAttempt.score / typedAttempt.total_points) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Link href="/quizzes" className="inline-block text-sm text-indigo-600 hover:text-indigo-700 mb-5">→ رجوع لاختباراتي</Link>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <p className="text-sm text-gray-500">نتيجة الاختبار</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{typedAttempt.quizzes?.title}</h1>
          <div className="my-7 rounded-2xl bg-indigo-50 p-6 text-center">
            <p className="text-4xl font-bold text-indigo-700">{percentage}%</p>
            <p className="mt-2 text-sm text-indigo-900">حصلت على {typedAttempt.score} من {typedAttempt.total_points} درجة</p>
          </div>
          <h2 className="font-semibold text-gray-900 mb-3">مراجعة الإجابات</h2>
          <div className="space-y-3">
            {typedAnswers.map((answer, index) => (
              <div key={answer.id} className={`rounded-xl border p-4 ${answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-sm font-medium text-gray-900">{index + 1}. {answer.quiz_questions?.question_text}</p>
                <p className={`text-xs mt-2 ${answer.is_correct ? 'text-green-700' : 'text-red-700'}`}>{answer.is_correct ? `إجابة صحيحة — ${answer.points_awarded} درجة` : 'إجابة غير صحيحة'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
