import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Play } from 'lucide-react'
import { getYouTubeEmbedUrl, hasPlayableVideo, isLocalVideoUrl } from '../../utils/videoUtils'

export function VideoModal({ isOpen, onClose, title, description, videoUrl, thumbnailUrl }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl)
  const showLocalVideo = !youtubeEmbed && isLocalVideoUrl(videoUrl)
  const showPlayer = hasPlayableVideo(videoUrl)

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title || 'Video player'}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 sm:p-6">
          {showPlayer && youtubeEmbed ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={youtubeEmbed}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : showPlayer && showLocalVideo ? (
            <video
              controls
              preload="metadata"
              poster={thumbnailUrl || undefined}
              className="w-full rounded-xl"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C4511A] text-white shadow-lg ring-4 ring-white/90">
                <Play className="ml-0.5 h-7 w-7 fill-current" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Video coming soon</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Add a YouTube URL or video file in CMS to show the player here.
              </p>
            </div>
          )}

          {title && <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>}
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default VideoModal
