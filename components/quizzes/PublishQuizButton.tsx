'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  quizId: string
  isPublished: boolean
  hasQuestions: boolean
}

export default function PublishQuizButton({ quizId, isPublished, hasQuestions }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function togglePublish() {
    setLoading(true)

    await supabase
      .from('quizzes')
      .update({ is_published: !isPublished })
      .eq('id', quizId)

    setLoading(false)
    router.refresh()
  }

  if (isPublished) {
    return (
      <button
        onClick={togglePublish}
        disabled={loading}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        {loading ? 'جاري الإخفاء...' : 'إخفاء الاختبار (رجوع لمسودة)'}
      </button>
    )
  }

  return (
    <button
      onClick={togglePublish}
      disabled={loading || !hasQuestions}
      className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      title={!hasQuestions ? 'لازم تضيفي سؤال واحد على الأقل الأول' : ''}
    >
      {loading ? 'جاري النشر...' : '🚀 نشر الاختبار للطلاب'}
    </button>
  )
}