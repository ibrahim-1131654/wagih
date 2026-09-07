'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { studentCodeToEmail, isValidStudentCode } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    studentCode: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isValidStudentCode(form.studentCode)) {
      setError('كود الطالب يجب أن يكون من 3 إلى 20 حرفًا أو رقمًا، ويُسمح فقط بـ - و _.')
      return
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 أحرف.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)

    // Check student_code uniqueness before attempting signup for a clearer error
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_code', form.studentCode.trim())
      .maybeSingle()

    if (existing) {
      setError('كود الطالب مسجل بالفعل.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: studentCodeToEmail(form.studentCode),
      password: form.password,
      options: {
        data: {
          student_code: form.studentCode.trim(),
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          role: 'student',
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">إنشاء حساب جديد</h1>
        <p className="text-sm text-gray-500 mb-6">سجّل بياناتك باستخدام كود الطالب</p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كود الطالب</label>
            <input
              type="text"
              required
              value={form.studentCode}
              onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
              dir="ltr"
              placeholder="STU2024001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالكامل</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
        >
          {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          لديك حساب بالفعل؟{' '}
          <a href="/login" className="text-indigo-600 font-medium">سجّل الدخول</a>
        </p>
      </form>
    </div>
  )
}
