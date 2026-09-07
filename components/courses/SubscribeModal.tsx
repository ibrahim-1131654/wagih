'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CopyPaymentNumberButton from './CopyPaymentNumberButton'

type Course = {
  id: string
  title: string
  price: number
  currency: string
}

type Props = {
  course: Course
  onClose: () => void
}

const INSTAPAY_NUMBER = '01003012968'

export default function SubscribeModal({ course, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [transactionReference, setTransactionReference] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setError('')

    if (!transactionReference.trim() && !receiptFile) {
      setError('لازم تدخل رقم العملية أو ترفع صورة الإيصال.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('لازم تكون مسجل دخول.')
      setLoading(false)
      return
    }

    // 1. نعمل صف في course_subscriptions بحالة pending
    const { data: subscription, error: subError } = await supabase
      .from('course_subscriptions')
      .upsert(
        {
          student_id: user.id,
          course_id: course.id,
          status: 'pending',
        },
        { onConflict: 'student_id,course_id' }
      )
      .select()
      .single()

    if (subError || !subscription) {
      setError(subError?.message || 'حصل خطأ أثناء إنشاء الاشتراك.')
      setLoading(false)
      return
    }

    // 2. لو فيه صورة إيصال، نرفعها في الـ storage
    let receiptUrl: string | null = null

    if (receiptFile) {
      const filePath = `${user.id}/${course.id}-${Date.now()}-${receiptFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, receiptFile)

      if (uploadError) {
        setError('حصل خطأ أثناء رفع الصورة: ' + uploadError.message)
        setLoading(false)
        return
      }

      receiptUrl = filePath
    }

    // 3. نسجل طلب التحقق من الدفع
    const { error: verificationError } = await supabase
      .from('payment_verifications')
      .insert({
        subscription_id: subscription.id,
        student_id: user.id,
        course_id: course.id,
        amount: course.price,
        transaction_reference: transactionReference.trim() || null,
        receipt_screenshot_url: receiptUrl,
        status: 'pending',
      })

    setLoading(false)

    if (verificationError) {
      setError(verificationError.message)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">الاشتراك في الكورس</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-1">{course.title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-5">
          {course.price} {course.currency}
        </p>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-indigo-900 mb-2">
            طريقة الدفع: InstaPay
          </p>
          <p className="text-sm text-indigo-800 mb-2">
            حوّل المبلغ عن طريق InstaPay إلى الرقم:
          </p>
          <p className="text-lg font-bold text-indigo-900 tracking-wider mb-2" dir="ltr">
            {INSTAPAY_NUMBER}
          </p>
          <CopyPaymentNumberButton number={INSTAPAY_NUMBER} />
          <p className="text-xs text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2">
            ⚠️تحويل بنكي وليس محفظة
          </p>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم العملية (Transaction Reference)
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="مثال: 123456789"
            />
          </div>

          <div className="text-center text-xs text-gray-400">— أو —</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              صورة إيصال التحويل
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
        >
          {loading ? 'جاري الإرسال...' : 'تأكيد التحويل'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          سيتم تفعيل الكورس بعد مراجعة الأدمن للدفعة. ستظهر الحالة في لوحة التحكم.
        </p>
      </div>
    </div>
  )
}
