'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Verification = {
  id: string
  subscription_id: string
  amount: number
  transaction_reference: string | null
  signedReceiptUrl: string | null
  created_at: string
  profiles: { full_name: string; student_code: string } | null
  courses: { title: string; price: number; currency: string } | null
}

const RECEIPT_ALT_TEXT = 'Payment receipt screenshot'

export default function PaymentReviewCard({ verification }: { verification: Verification }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  async function handleApprove() {
    setError('')
    setLoading('approve')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: subError } = await supabase
      .from('course_subscriptions')
      .update({
        status: 'active',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', verification.subscription_id)

    const { error: verError } = await supabase
      .from('payment_verifications')
      .update({
        status: 'active',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verification.id)

    setLoading(null)

    if (subError || verError) {
      setError(subError?.message || verError?.message || 'حصل خطأ.')
      return
    }

    router.refresh()
  }

  async function handleReject() {
    setError('')
    setLoading('reject')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: subError } = await supabase
      .from('course_subscriptions')
      .update({ status: 'rejected' })
      .eq('id', verification.subscription_id)

    const { error: verError } = await supabase
      .from('payment_verifications')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verification.id)

    setLoading(null)

    if (subError || verError) {
      setError(subError?.message || verError?.message || 'حصل خطأ.')
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900">{verification.profiles?.full_name}</p>
          <p className="text-sm text-gray-500">
            Student ID: {verification.profiles?.student_code}
          </p>
        </div>
        <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          بانتظار المراجعة
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-400">الكورس</p>
          <p className="font-medium text-gray-900">{verification.courses?.title}</p>
        </div>
        <div>
          <p className="text-gray-400">المبلغ</p>
          <p className="font-medium text-gray-900">
            {verification.amount} {verification.courses?.currency}
          </p>
        </div>
        <div>
          <p className="text-gray-400">رقم العملية</p>
          <p className="font-medium text-gray-900">
            {verification.transaction_reference || '—'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">التاريخ</p>
          <p className="font-medium text-gray-900">
            {new Date(verification.created_at).toLocaleString('ar-EG')}
          </p>
        </div>
      </div>

      {verification.signedReceiptUrl ? (
        <a href={verification.signedReceiptUrl} target="_blank" rel="noopener noreferrer" className="block mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={verification.signedReceiptUrl}
            alt={RECEIPT_ALT_TEXT}
            className="max-h-48 rounded-lg border border-gray-200 hover:opacity-90 transition"
          />
        </a>
      ) : null}

      {error ? (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          {loading === 'approve' ? 'جاري التفعيل...' : '✓ موافقة وتفعيل الكورس'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-sm font-medium py-2 rounded-lg transition"
        >
          {loading === 'reject' ? 'جاري الرفض...' : '✕ رفض'}
        </button>
      </div>
    </div>
  )
}