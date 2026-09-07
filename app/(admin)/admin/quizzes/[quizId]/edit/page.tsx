import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QuestionForm from '@/components/quizzes/QuestionForm'
import PublishQuizButton from '@/components/quizzes/PublishQuizButton'

type QuizOption = { id: string; is_correct: boolean; option_text: string }
type QuizQuestion = { id: string; question_text: string; image_url: string | null; quiz_options: QuizOption[] | null }

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  const supabase = await createClient()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (!quiz) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*, quiz_options ( * )')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/quizzes" className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← رجوع للاختبارات
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">{quiz.title}</h1>
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
          {quiz.description && (
            <p className="text-sm text-gray-500 mb-3">{quiz.description}</p>
          )}
          <p className="text-xs text-gray-400">
            عدد الأسئلة: {questions?.length || 0}
            {quiz.time_limit_minutes ? ` • المدة: ${quiz.time_limit_minutes} دقيقة` : ''}
          </p>

          <div className="mt-4">
            <PublishQuizButton
              quizId={quiz.id}
              isPublished={quiz.is_published}
              hasQuestions={(questions?.length || 0) > 0}
            />
          </div>
        </div>

        {questions && questions.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="font-semibold text-gray-900">الأسئلة الحالية</h2>
            {questions.map((q: QuizQuestion, index: number) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {index + 1}. {q.question_text}
                </p>
                {q.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.image_url} alt="صورة السؤال" className="max-h-32 rounded-lg mb-2" />
                )}
                <div className="space-y-1">
                  {q.quiz_options?.map((opt: QuizOption) => (
                    <div
                      key={opt.id}
                      className={`text-xs px-2 py-1 rounded ${
                        opt.is_correct
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {opt.is_correct ? '✓ ' : ''}{opt.option_text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <QuestionForm quizId={quiz.id} />
      </div>
    </div>
  )
}
