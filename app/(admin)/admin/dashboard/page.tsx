import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // احتياط إضافي في الصفحة نفسها فوق الـ middleware
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const [{ count: studentsCount }, { count: pendingPaymentsCount }, { count: publishedCoursesCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('payment_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              لوحة تحكم الأدمن
            </h1>
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <p className="text-sm text-gray-500">
            أهلاً {profile?.full_name} — Student ID: {profile?.student_code}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">عدد الطلاب</p>
            <p className="text-3xl font-semibold text-gray-900">{studentsCount ?? 0}</p>
          </div>
          <Link href="/admin/payments" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-yellow-300 transition">
            <p className="text-sm text-gray-500 mb-1">دفعات معلّقة</p>
            <p className="text-3xl font-semibold text-gray-900">{pendingPaymentsCount ?? 0}</p>
          </Link>
          <Link href="/admin/courses" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-indigo-300 transition">
            <p className="text-sm text-gray-500 mb-1">الكورسات المنشورة</p>
            <p className="text-3xl font-semibold text-gray-900">{publishedCoursesCount ?? 0}</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <Link href="/admin/courses" className="rounded-xl bg-white border border-gray-100 p-4 text-center text-sm font-medium text-indigo-700 hover:bg-indigo-50">إدارة الكورسات</Link>
          <Link href="/admin/quizzes" className="rounded-xl bg-white border border-gray-100 p-4 text-center text-sm font-medium text-indigo-700 hover:bg-indigo-50">إدارة الاختبارات</Link>
          <Link href="/admin/live" className="rounded-xl bg-red-600 p-4 text-center text-sm font-medium text-white hover:bg-red-700">إدارة البث المباشر</Link>
          <Link href="/admin/payments" className="rounded-xl bg-yellow-500 p-4 text-center text-sm font-medium text-white hover:bg-yellow-600">مراجعة الدفعات</Link>
        </div>

       {/* <form action="/auth/signout" method="post" className="mt-6">
          <button type="submit" className="text-sm text-red-600 hover:text-red-700 font-medium">
            تسجيل الخروج
          </button>
        </form> */}
      </div>
    </div>
  )
}
