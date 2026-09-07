import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLivePage() {
  const supabase = await createClient()
  const { data: liveClasses } = await supabase
    .from('live_classes')
    .select('*')
    .order('scheduled_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">الحصص المباشرة</h1>
          <Link
            href="/admin/live/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + إضافة حصة
          </Link>
        </div>

        <div className="space-y-3">
          {liveClasses?.map((lc) => (
            <div key={lc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="font-medium text-gray-900">{lc.title}</p>
              <p className="text-sm text-gray-500">
                {lc.scheduled_at ? new Date(lc.scheduled_at).toLocaleString('ar-EG') : 'بدون معاد محدد'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}