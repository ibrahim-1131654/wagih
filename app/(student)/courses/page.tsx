import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/courses/CourseCard'

export default async function CoursesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { data: subscriptions } = await supabase
    .from('course_subscriptions')
    .select('course_id, status')
    .eq('student_id', user?.id)

  function getSubscriptionStatus(courseId: string) {
    return subscriptions?.find((s) => s.course_id === courseId)?.status
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">الكورسات المتاحة</h1>
        <p className="text-sm text-gray-500 mb-6">اختر الكورس الذي يناسبك وابدأ التعلّم</p>

        {(!courses || courses.length === 0) && (
          <p className="text-gray-500 text-sm">لسه مفيش كورسات متاحة حاليًا.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses?.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              subscriptionStatus={getSubscriptionStatus(course.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
