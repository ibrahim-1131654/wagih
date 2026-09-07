import Link from "next/link"
import { Send, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CourseCard } from "@/components/course-card"
import { courses } from "@/lib/courses"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-800/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              كورسات احترافية بين يديك
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-tight text-gray-50 sm:text-5xl md:text-6xl">
              تعلّم مهارات المستقبل مع <span className="text-indigo-400">المنصة التعليمية</span>
            </h1>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-gray-400">
              مجموعة مختارة من الكورسات في البرمجة والتصميم وعلوم البيانات، يقدّمها نخبة من المدربين
              المحترفين. ابدأ رحلتك التعليمية اليوم وطوّر مهاراتك خطوة بخطوة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#courses"
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                تصفّح الكورسات
              </a>
              <Link
                href="/login"
                className="rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-gray-100 transition-colors hover:border-indigo-500 hover:text-indigo-400"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-bold text-gray-50 sm:text-4xl">الكورسات المتاحة</h2>
            <p className="mx-auto max-w-xl text-pretty leading-relaxed text-gray-400">
              اختر الكورس المناسب لك وابدأ التعلّم فوراً مع محتوى عملي ومشاريع تطبيقية.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-gray-800/80 bg-gray-900/40">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-gray-50">هل لديك أي استفسار؟</h2>
            <p className="max-w-lg text-pretty leading-relaxed text-gray-400">
              فريقنا جاهز لمساعدتك في اختيار الكورس المناسب والإجابة على كل أسئلتك.
            </p>
            <a
              href="https://t.me/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-indigo-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              تواصل معنا
            </a>
            <a
              href="https://t.me/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تواصل معنا عبر تيليجرام"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-700 bg-gray-950 text-indigo-400 transition-colors hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800/80 bg-gray-950 py-6">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} المنصة التعليمية. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  )
}
