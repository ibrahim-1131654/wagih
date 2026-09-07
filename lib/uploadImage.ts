import { createClient } from '@/lib/supabase/client'

export async function uploadImage(
  file: File,
  bucket: 'quiz-images' | 'course-covers',
  folder: string
): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabase.storage.from(bucket).upload(fileName, file)

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

// دالة قديمة سيبناها شغالة عشان الأماكن اللي بتستخدمها لسه (أسئلة الاختبارات)
export async function uploadQuizImage(file: File, folder: string): Promise<string | null> {
  return uploadImage(file, 'quiz-images', folder)
}