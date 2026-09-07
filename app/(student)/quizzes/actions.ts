'use server'

import { createClient } from '@/lib/supabase/server'

type Answer = { questionId: string; selectedOptionId: string }

export async function submitQuizAttempt(quizId: string, answers: Answer[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى.' }
  if (!quizId || answers.some((answer) => !answer.questionId || !answer.selectedOptionId)) return { error: 'تعذر إرسال الإجابات. حاول مرة أخرى.' }

  const { data: attemptId, error } = await supabase.rpc('submit_quiz_attempt', {
    p_quiz_id: quizId,
    p_answers: answers.map((answer) => ({ question_id: answer.questionId, selected_option_id: answer.selectedOptionId })),
  })
  if (error || !attemptId) return { error: error?.message || 'تعذر حفظ المحاولة.' }
  return { attemptId }
}
