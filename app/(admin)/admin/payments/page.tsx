import { createClient } from '@/lib/supabase/server'
import PaymentReviewCard from '@/components/admin/PaymentReviewCard'

type RawVerification = {
  id: string
  subscription_id: string
  amount: number
  transaction_reference: string | null
  receipt_screenshot_url: string | null
  status: string
  created_at: string
  profiles: { full_name: string; student_code: string }[] | { full_name: string; student_code: string } | null
  courses: { title: string; price: number; currency: string }[] | { title: string; price: number; currency: string } | null
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: verifications } = await supabase
    .from('payment_verifications')
    .select(`
      id,
      subscription_id,
      amount,
      transaction_reference,
      receipt_screenshot_url,
      status,
      created_at,
      profiles:student_id ( full_name, student_code ),
      courses:course_id ( title, price, currency )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const rawList = (verifications || []) as unknown as RawVerification[]

  const verificationsWithUrls = await Promise.all(
    rawList.map(async (v) => {
      let signedUrl: string | null = null

      if (v.receipt_screenshot_url) {
        const { data } = await supabase.storage
          .from('payment-receipts')
          .createSignedUrl(v.receipt_screenshot_url, 60 * 10)

        signedUrl = data?.signedUrl || null
      }

      const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
      const course = Array.isArray(v.courses) ? v.courses[0] : v.courses

      return {
        id: v.id,
        subscription_id: v.subscription_id,
        amount: v.amount,
        transaction_reference: v.transaction_reference,
        created_at: v.created_at,
        signedReceiptUrl: signedUrl,
        profiles: profile,
        courses: course,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">مراجعة الدفعات</h1>
        <p className="text-sm text-gray-500 mb-6">
          الدفعات المعلّقة اللي محتاجة موافقتك ({verificationsWithUrls.length})
        </p>

        {verificationsWithUrls.length === 0 ? (
          <p className="text-gray-500 text-sm">مفيش دفعات معلّقة حاليًا</p>
        ) : null}

        <div className="space-y-4">
          {verificationsWithUrls.map((v) => (
            <PaymentReviewCard key={v.id} verification={v} />
          ))}
        </div>
      </div>
    </div>
  )
}