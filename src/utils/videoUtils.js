export function getYouTubeEmbedUrl(videoUrl) {
  if (!videoUrl || videoUrl === '#') return null
  const match = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
  )
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return null
}

export function isLocalVideoUrl(videoUrl) {
  if (!videoUrl || videoUrl === '#') return false
  if (getYouTubeEmbedUrl(videoUrl)) return false
  return /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl) || videoUrl.startsWith('/')
}

export function hasPlayableVideo(videoUrl) {
  if (!videoUrl || videoUrl === '#') return false
  const trimmed = String(videoUrl).trim()
  return trimmed.length > 0 && (getYouTubeEmbedUrl(trimmed) || isLocalVideoUrl(trimmed))
}

export function isVideoResource(post) {
  return post?.mediaType === 'video' || post?.type === 'video'
}
