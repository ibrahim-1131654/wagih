import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen flex">
      <nav className="w-56 bg-gray-900 text-white flex flex-col p-5 fixed right-0 top-0 h-screen">
        <p className="font-bold mb-1">لوحة التحكم</p>
        <p className="text-xs text-gray-400 mb-8">Admin Panel</p>

        <div className="flex flex-col gap-1 flex-1">
          <Link href="/admin/dashboard" className="hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الرئيسية
          </Link>
          <Link href="/admin/courses" className="hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الكورسات
          </Link>
          <Link href="/admin/quizzes" className="hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الاختبارات
          </Link>
          <Link href="/admin/payments" className="hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الدفعات
          </Link>
          <Link href="/admin/live" className="hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            البث المباشر
          </Link>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full text-right text-sm text-red-400 hover:bg-gray-800 font-medium px-3 py-2 rounded-lg transition"
          >
            تسجيل الخروج
          </button>
        </form>
      </nav>

      <main className="flex-1 mr-56">{children}</main>
    </div>
  )
}
