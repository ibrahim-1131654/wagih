'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuizAttempt } from '@/app/(student)/quizzes/actions'

type QuizOption = { id: string; option_text: string; image_url: string | null }
type QuizQuestion = { id: string; question_text: string; image_url: string | null; points: number; quiz_options: QuizOption[] }
type Props = { quizId: string; questions: QuizQuestion[]; timeLimitMinutes: number | null }

function formatTime(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export default function QuizPlayer({ quizId, questions, timeLimitMinutes }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const question = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  async function finishAttempt() {
    if (submitting) return
    setSubmitting(true)
    setError('')
    const result = await submitQuizAttempt(quizId, Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })))
    if ('error' in result) {
      setError(result.error ?? 'تعذر حفظ المحاولة.')
      setSubmitting(false)
      return
    }
    router.push(`/quizzes/attempts/${result.attemptId}`)
    router.refresh()
  }

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((seconds) => (seconds === null ? null : seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0) {
      const timeout = window.setTimeout(() => void finishAttempt(), 0)
      return () => window.clearTimeout(timeout)
    }
    // لا نريد إعادة بدء المؤقت عند تغيّر الإجابات أو السؤال المعروض.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <span className="text-sm font-medium text-indigo-700">السؤال {currentIndex + 1} من {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{question.points} درجة</span>
          {secondsLeft !== null && <span className={`text-sm font-bold tabular-nums ${secondsLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>الوقت المتبقي: {formatTime(secondsLeft)}</span>}
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100 mb-6 overflow-hidden" aria-hidden="true"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
      <h2 className="text-lg font-semibold text-gray-900 whitespace-pre-wrap mb-4">{question.question_text}</h2>
      {question.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={question.image_url} alt="صورة السؤال" className="max-h-72 rounded-xl border border-gray-100 mb-5" />
      )}
      <fieldset className="space-y-3" disabled={submitting}>
        <legend className="sr-only">اختيارات السؤال</legend>
        {question.quiz_options.map((option, index) => {
          const isSelected = answers[question.id] === option.id
          return <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}>
            <input type="radio" name={question.id} value={option.id} checked={isSelected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} className="mt-1" />
            <span className="flex-1 text-sm text-gray-800"><span className="font-medium text-indigo-700">{String.fromCharCode(65 + index)}. </span>{option.option_text}
              {option.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={option.image_url} alt={`صورة الاختيار ${index + 1}`} className="max-h-40 rounded-lg mt-3" />
              )}
            </span>
          </label>
        })}
      </fieldset>
      {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex items-center justify-between mt-7">
        <button type="button" onClick={() => setCurrentIndex((index) => index - 1)} disabled={currentIndex === 0 || submitting} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40">السابق</button>
        {currentIndex === questions.length - 1 ? (
          <button type="button" onClick={() => void finishAttempt()} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">{submitting ? 'جارٍ التصحيح...' : `إنهاء الاختبار (${answeredCount}/${questions.length})`}</button>
        ) : <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">التالي</button>}
      </div>
    </section>
  )
}
