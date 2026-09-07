import Link from "next/link"
import { GraduationCap, LogIn } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-indigo-500 hover:text-indigo-400"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          <span>تسجيل الدخول / Login</span>
        </Link>

        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-gray-100">
          <span>المنصة التعليمية</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </Link>
      </nav>
    </header>
  )
}
