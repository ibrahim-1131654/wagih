'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { studentCodeToEmail } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [studentCode, setStudentCode] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    // تحويل كود الطالب إلى الإيميل الوهمي المسجل في Supabase Auth
    const email = studentCodeToEmail(studentCode.trim())

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg('كود الطالب أو كلمة المرور غير صحيحة')
    } else {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir="rtl">
      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-md p-8 bg-white border rounded-xl shadow-lg gap-4">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">تسجيل الدخول </h1>

        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">كود الطالب (Student ID)</label>
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-gray-900 bg-white" 
            dir="ltr"
            type="text" 
            required 
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="STU2024001" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">كلمة المرور</label>
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-gray-900 bg-white" 
            dir="ltr"
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400"
        >
          {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
        </button>

        <div className="text-center mt-2">
          <span className="text-gray-600 text-sm">ليس لديك حساب؟ </span>
          <Link href="/register" className="text-blue-600 font-semibold text-sm hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </div>
      </form>
    </div>
  )
}
