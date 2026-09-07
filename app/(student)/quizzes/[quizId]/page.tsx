'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichContent from '@/components/quizzes/RichContent'

export default function TakeQuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*, quiz_options ( id, option_text, image_url, order_index )')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })

      setQuiz(quizData)
      setQuestions(questionsData || [])
      setLoading(false)
    }
    load()
  }, [quizId])

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  async function handleSubmit() {
    setError('')

    if (Object.keys(answers).length < questions.length) {
      setError('لازم تجاوبي على كل الأسئلة قبل التسليم.')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: user?.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError || !attempt) {
      setError('حصل خطأ أثناء بدء المحاولة.')
      setSubmitting(false)
      return
    }

    // نجيب الإجابات الصحيحة عشان نصحح
    const { data: correctOptions } = await supabase
      .from('quiz_options')
      .select('id, question_id, is_correct')
      .in('question_id', questions.map((q) => q.id))

    let totalScore = 0
    let totalPoints = 0

    const answerRows = questions.map((q) => {
      const selectedOptionId = answers[q.id]
      const correctOption = correctOptions?.find((o) => o.question_id === q.id && o.is_correct)
      const isCorrect = selectedOptionId === correctOption?.id

      totalPoints += q.points
      if (isCorrect) totalScore += q.points

      return {
        attempt_id: attempt.id,
        question_id: q.id,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
      }
    })

    await supabase.from('quiz_answers').insert(answerRows)

    await supabase
      .from('quiz_attempts')
      .update({
        score: totalScore,
        total_points: totalPoints,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', attempt.id)

    setSubmitting(false)
    router.push(`/quizzes/${quizId}/result?attemptId=${attempt.id}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">جاري التحميل...</div>
  }

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">الاختبار غير موجود.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-gray-500">{quiz.description}</p>}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-2">سؤال {index + 1} من {questions.length} ({q.points} درجة)</p>

              <div className="mb-3">
                <RichContent text={q.question_text} />
              </div>

              {q.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.image_url} alt="صورة السؤال" className="max-w-full rounded-lg mb-4 border border-gray-100" />
              )}

              <div className="space-y-2">
                {q.quiz_options
                  ?.sort((a: any, b: any) => a.order_index - b.order_index)
                  .map((opt: any) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition ${
                        answers[q.id] === opt.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={answers[q.id] === opt.id}
                        onChange={() => selectAnswer(q.id, opt.id)}
                      />
                      <div className="flex-1">
                        {opt.option_text && <RichContent text={opt.option_text} />}
                        {opt.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={opt.image_url} alt="صورة الاختيار" className="max-h-32 rounded-lg mt-1" />
                        )}
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
        >
          {submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
        </button>
      </div>
    </div>
  )
}