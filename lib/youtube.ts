export function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname === 'youtu.be') videoId = parsed.pathname.slice(1)
    if (parsed.hostname.endsWith('youtube.com')) {
      videoId = parsed.searchParams.get('v')
      if (parsed.pathname.startsWith('/live/')) videoId = parsed.pathname.split('/')[2]
      if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/')[2]
    }

    return videoId && /^[\w-]{11}$/.test(videoId) ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}
