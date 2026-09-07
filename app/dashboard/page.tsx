import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Subscription = { course_id: string; status: string; courses: { title: string } | null }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, student_code, role').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin/dashboard')

  const [{ data: rawSubscriptions }, { count: attemptsCount }, { data: rawLiveSessions }] = await Promise.all([
    supabase.from('course_subscriptions').select('course_id, status, courses:course_id ( title )').eq('student_id', user.id).order('created_at', { ascending: false }),
    supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
    supabase.from('live_sessions').select('id, title, course_id').eq('is_live', true).order('starts_at', { ascending: true }).limit(3),
  ])
  const subscriptions = (rawSubscriptions ?? []) as unknown as Subscription[]
  const activeCourses = subscriptions.filter((subscription) => subscription.status === 'active')
  const pendingCourses = subscriptions.filter((subscription) => subscription.status === 'pending')
  const liveSessions = (rawLiveSessions ?? []) as unknown as Array<{ id: string; title: string; course_id: string | null }>
  const availableLiveSessions = liveSessions.filter((session) => !session.course_id || activeCourses.some((course) => course.course_id === session.course_id))

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <header className="rounded-3xl bg-gradient-to-l from-indigo-700 to-violet-600 p-7 text-white shadow-lg sm:p-9">
          <p className="text-sm text-indigo-100">لوحة الطالب</p>
          <h1 className="mt-2 text-3xl font-bold">أهلًا، {profile?.full_name || 'طالبنا'} 👋</h1>
          <p className="mt-2 text-sm text-indigo-100">تابع كورساتك واختباراتك والبث المباشر من مكان واحد.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/courses" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">استكشف الكورسات</Link>
            <Link href="/quizzes" className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">اختباراتي</Link>
            <Link href="/live" className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">🔴 البث المباشر</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
          <Link href="/courses" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-200"><p className="text-sm text-slate-500">الكورسات المفعّلة</p><p className="mt-2 text-3xl font-bold text-slate-900">{activeCourses.length}</p></Link>
          <Link href="/quizzes" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-200"><p className="text-sm text-slate-500">محاولات الاختبارات</p><p className="mt-2 text-3xl font-bold text-slate-900">{attemptsCount ?? 0}</p></Link>
          <Link href="/live" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-red-200"><p className="text-sm text-slate-500">بث مباشر متاح</p><p className="mt-2 text-3xl font-bold text-red-600">{availableLiveSessions.length}</p></Link>
        </section>

        <section className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">كورساتك</h2><Link href="/courses" className="text-sm font-medium text-indigo-600">عرض الكل</Link></div>
            <div className="mt-4 space-y-3">
              {activeCourses.slice(0, 3).map((course) => <div key={course.course_id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-medium text-slate-800">{course.courses?.title || 'كورس'}</span><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">مفعّل</span></div>)}
              {!activeCourses.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">لا يوجد كورس مفعّل حتى الآن. ابدأ باختيار كورس مناسب.</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-slate-900">تنبيهاتك</h2>
            <div className="mt-4 space-y-3 text-sm">
              {pendingCourses.length > 0 && <p className="rounded-xl bg-yellow-50 p-3 text-yellow-800">لديك {pendingCourses.length} طلب اشتراك بانتظار مراجعة الدفع.</p>}
              {availableLiveSessions.map((session) => <Link key={session.id} href="/live" className="block rounded-xl bg-red-50 p-3 text-red-700">🔴 بث مباشر الآن: {session.title}</Link>)}
              {!pendingCourses.length && !availableLiveSessions.length && <p className="rounded-xl bg-slate-50 p-3 text-slate-500">لا توجد تنبيهات جديدة.</p>}
            </div>
          </div>
        </section>
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400"><span>كود الطالب: {profile?.student_code}</span><form action="/auth/signout" method="post"><button className="font-medium text-red-600 hover:text-red-700">تسجيل الخروج</button></form></div>
      </div>
    </main>
  )
}
