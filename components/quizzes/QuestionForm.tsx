'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadQuizImage } from '@/lib/uploadImage'

type OptionInput = {
  text: string
  imageFile: File | null
  isCorrect: boolean
}

const EMPTY_OPTION: OptionInput = { text: '', imageFile: null, isCorrect: false }

export default function QuestionForm({ quizId }: { quizId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [questionText, setQuestionText] = useState('')
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null)
  const [points, setPoints] = useState('1')
  const [options, setOptions] = useState<OptionInput[]>([
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
    { ...EMPTY_OPTION },
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateOptionText(index: number, text: string) {
    const next = [...options]
    next[index] = { ...next[index], text }
    setOptions(next)
  }

  function updateOptionImage(index: number, file: File | null) {
    const next = [...options]
    next[index] = { ...next[index], imageFile: file }
    setOptions(next)
  }

  function setCorrectOption(index: number) {
    const next = options.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    setOptions(next)
  }

  function addOption() {
    setOptions([...options, { ...EMPTY_OPTION }])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return // لازم يفضل اختيارين على الأقل
    setOptions(options.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!questionText.trim()) {
      setError('اكتب نص السؤال.')
      return
    }
    const filledOptions = options.filter((o) => o.text.trim() || o.imageFile)
    if (filledOptions.length < 2) {
      setError('لازم اختيارين على الأقل بينهم نص أو صورة.')
      return
    }
    if (!options.some((o) => o.isCorrect)) {
      setError('لازم تحدد الإجابة الصحيحة.')
      return
    }

    setLoading(true)

    // 1. نرفع صورة السؤال لو موجودة
    let questionImageUrl: string | null = null
    if (questionImageFile) {
      questionImageUrl = await uploadQuizImage(questionImageFile, `questions/${quizId}`)
      if (!questionImageUrl) {
        setError('حصل خطأ أثناء رفع صورة السؤال.')
        setLoading(false)
        return
      }
    }

    // 2. نجيب أعلى order_index حالي عشان السؤال الجديد يترتب بعد الأسئلة الموجودة
    const { data: existingQuestions } = await supabase
      .from('quiz_questions')
      .select('order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1

    // 3. نضيف السؤال نفسه
    const { data: question, error: qError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: questionText.trim(),
        image_url: questionImageUrl,
        order_index: nextOrderIndex,
        points: parseFloat(points) || 1,
      })
      .select()
      .single()

    if (qError || !question) {
      setError(qError?.message || 'حصل خطأ أثناء إضافة السؤال.')
      setLoading(false)
      return
    }

    // 4. نرفع صور الاختيارات (اللي عندها صورة) ونضيف كل الاختيارات
    for (let i = 0; i < options.length; i++) {
      const opt = options[i]
      if (!opt.text.trim() && !opt.imageFile) continue

      let optionImageUrl: string | null = null
      if (opt.imageFile) {
        optionImageUrl = await uploadQuizImage(opt.imageFile, `options/${quizId}`)
      }

      const { error: optError } = await supabase.from('quiz_options').insert({
        question_id: question.id,
        option_text: opt.text.trim(),
        image_url: optionImageUrl,
        is_correct: opt.isCorrect,
        order_index: i,
      })

      if (optError) {
        setError('السؤال اتضاف بس حصل خطأ في أحد الاختيارات: ' + optError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.refresh()

    // نصفّر الفورم عشان تقدر تضيفي سؤال تاني على طول
    setQuestionText('')
    setQuestionImageFile(null)
    setPoints('1')
    setOptions([{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }, { ...EMPTY_OPTION }, { ...EMPTY_OPTION }])
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-gray-900">إضافة سؤال جديد</h2>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نص السؤال (تقدر تكتب معادلات بصيغة LaTeX زي $x^2$ وكود بره ثلاث علامات ```)
        </label>
        <textarea
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          placeholder="مثال: احسبي قيمة التيار I في الدائرة الموضحة بالأسفل"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          صورة السؤال (اختياري — مخطط دائرة، Simulink، جدول، إلخ)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setQuestionImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">درجة السؤال</label>
        <input
          type="number"
          step="0.5"
          min="0.5"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">الاختيارات</label>

        {options.map((opt, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={opt.isCorrect}
                onChange={() => setCorrectOption(i)}
                className="mt-2.5"
                title="حددي هنا لو ده الاختيار الصحيح"
              />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOptionText(i, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder={`الاختيار ${i + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-red-400 hover:text-red-600 px-2"
                  title="حذف الاختيار"
                >
                  ×
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateOptionImage(i, e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-600 file:text-xs"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + إضافة اختيار تاني
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
      >
        {loading ? 'جاري الإضافة...' : '+ إضافة السؤال'}
      </button>
    </form>
  )
}
