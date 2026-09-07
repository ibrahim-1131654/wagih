import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">الكورسات</h1>
          <Link
            href="/admin/courses/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + إضافة كورس
          </Link>
        </div>

        {(!courses || courses.length === 0) && (
          <p className="text-gray-500 text-sm">لسه مفيش كورسات . إضافة واحد.</p>
        )}

        <div className="space-y-3">
          {courses?.map((course) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}/edit`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{course.title}</p>
                <p className="text-sm text-gray-500">{course.price} {course.currency}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  course.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {course.is_published ? 'منشور' : 'مسودة'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
