'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import RichContent from '@/components/quizzes/RichContent'

export default function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const searchParams = useSearchParams()
  const attemptId = searchParams.get('attemptId')
  const supabase = createClient()

  const [attempt, setAttempt] = useState<any>(null)
  const [details, setDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: attemptData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()

      const { data: answers } = await supabase
        .from('quiz_answers')
        .select(`
          is_correct,
          selected_option_id,
          quiz_questions:question_id ( id, question_text, points, quiz_options ( id, option_text, is_correct ) )
        `)
        .eq('attempt_id', attemptId)

      setAttempt(attemptData)
      setDetails(answers || [])
      setLoading(false)
    }
    if (attemptId) load()
  }, [attemptId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">جاري التحميل...</div>
  }

  const percentage = attempt ? Math.round((attempt.score / attempt.total_points) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">نتيجتك</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {attempt?.score} / {attempt?.total_points}
          </p>
          <p className={`text-lg font-medium ${percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {percentage}%
          </p>
        </div>

        <div className="space-y-3">
          {details.map((d: any, i: number) => {
            const q = d.quiz_questions
            const correctOption = q?.quiz_options?.find((o: any) => o.is_correct)
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="mb-2">
                  <RichContent text={`${i + 1}. ${q?.question_text}`} />
                </div>
                <p className={`text-sm ${d.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                  {d.is_correct ? '✓ إجابة صحيحة' : `✗ إجابة خاطئة — الصح: ${correctOption?.option_text}`}
                </p>
              </div>
            )
          })}
        </div>

        <Link
          href="/quizzes"
          className="block text-center mt-6 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          ← رجوع للاختبارات
        </Link>
      </div>
    </div>
  )
}