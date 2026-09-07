import Link from 'next/link'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen flex bg-gray-950 text-gray-100">
      <nav className="w-56 bg-gray-900 text-white flex flex-col p-5 fixed right-0 top-0 h-screen border-l border-gray-800">
        <p className="font-bold mb-1">المنصة التعليمية</p>
        <p className="text-xs text-gray-400 mb-8">Student Portal</p>

        <div className="flex flex-col gap-1 flex-1">
          <Link href="/dashboard" className="text-gray-300 hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الرئيسية
          </Link>
          <Link href="/courses" className="text-gray-300 hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الكورسات
          </Link>
          <Link href="/quizzes" className="text-gray-300 hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
            الاختبارات
          </Link>
          <Link href="/live" className="text-gray-300 hover:bg-gray-800 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg transition">
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