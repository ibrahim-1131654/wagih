export type Course = {
  id: string
  title: string
  description: string
  instructor: string
  price: string
  thumbnail: string
}

export const courses: Course[] = [
  {
    id: "web-development",
    title: "تطوير الويب الاحترافي",
    description:
      "تعلم بناء تطبيقات ويب حديثة من الصفر باستخدام React و Next.js وأحدث أدوات الفرونت إند.",
    instructor: "أحمد محمود",
    price: "٤٩٩ ج.م",
    thumbnail: "/courses/web-development.png",
  },
  {
    id: "data-science",
    title: "علوم البيانات والتعلم الآلي",
    description:
      "ادخل عالم الذكاء الاصطناعي وتحليل البيانات وبناء نماذج التعلم الآلي بلغة بايثون خطوة بخطوة.",
    instructor: "سارة عبد الله",
    price: "٦٩٩ ج.م",
    thumbnail: "/courses/data-science.png",
  },
  {
    id: "ui-design",
    title: "تصميم واجهات المستخدم UI/UX",
    description:
      "احترف تصميم واجهات وتجارب المستخدم باستخدام مبادئ التصميم الحديثة وأدوات مثل Figma.",
    instructor: "منى خالد",
    price: "٣٩٩ ج.م",
    thumbnail: "/courses/ui-design.png",
  },
]
