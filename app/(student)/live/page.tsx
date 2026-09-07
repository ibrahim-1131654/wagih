import { createClient } from '@/lib/supabase/server'

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default async function StudentLivePage() {
  const supabase = await createClient()
  const { data: liveClasses } = await supabase
    .from('live_classes')
    .select('*')
    .order('scheduled_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">الحصص المباشرة</h1>

        {(!liveClasses || liveClasses.length === 0) && (
          <p className="text-gray-500 text-sm">لا يوجد حصص متاحة حاليًا.</p>
        )}

        <div className="space-y-6">
          {liveClasses?.map((lc) => {
            const embedUrl = getYoutubeEmbedUrl(lc.stream_url || '')
            return (
              <div key={lc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {embedUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="font-semibold text-gray-900">{lc.title}</p>
                  <p className="text-sm text-gray-500">{lc.description}</p>
                  {lc.scheduled_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(lc.scheduled_at).toLocaleString('ar-EG')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}