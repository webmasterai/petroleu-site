import { useState } from 'react'
import { Play } from 'lucide-react'

const FALLBACK_GRADIENTS = {
  video: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #7c2d12 100%)',
  service: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #1e3a5f 100%)',
  blog: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #9a3412 100%)',
  cloud: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)',
}

function getThemeKey(post) {
  if (post.type === 'video') return 'video'
  if (post.type === 'service') return 'service'
  if (post.thumbnailType === 'cloud') return 'cloud'
  return 'blog'
}

function getPlayButtonClass(post) {
  return post.type === 'service' ? 'bg-emerald-600' : 'bg-[#C4511A]'
}

function FallbackPoster({ post }) {
  const theme = getThemeKey(post)
  const label = post.thumbnailLabel || post.category || 'Petroleu'

  return (
    <div
      className="absolute inset-0"
      style={{ background: FALLBACK_GRADIENTS[theme] }}
    >
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.08) 28px, rgba(255,255,255,0.08) 29px)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="absolute left-5 top-14 max-w-[70%]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-200/80">
          Petroleu
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-white/90">{label}</p>
      </div>

      <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
        <div className="mb-2 h-1.5 w-16 rounded-full bg-orange-400/70" />
        <div className="space-y-1.5">
          <div className="h-1 w-full rounded-full bg-white/20" />
          <div className="h-1 w-[80%] rounded-full bg-white/15" />
          <div className="h-1 w-[60%] rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}

export function ResourceThumbnail({ post, className = '', onVideoClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(post.thumbnailUrl) && !imgFailed
  const playBg = getPlayButtonClass(post)
  const showVideoUi = Boolean(onVideoClick)
  const duration = post.duration || '2:00'

  const mediaArea = (
    <>
      {showImage ? (
        <img
          src={post.thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <FallbackPoster post={post} />
      )}

      {post.category && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-orange-200 bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-orange-700 shadow-sm">
          {post.category}
        </span>
      )}

      {showVideoUi && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/90 ${playBg}`}
            >
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </div>
          <span className="absolute bottom-3 right-3 z-10 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        </>
      )}
    </>
  )

  return (
    <div
      className={`relative aspect-video h-[200px] w-full shrink-0 overflow-hidden rounded-t-2xl ${className}`}
    >
      {showVideoUi ? (
        <button
          type="button"
          onClick={onVideoClick}
          className="relative h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
          aria-label={`Play video: ${post.title}`}
        >
          {mediaArea}
        </button>
      ) : (
        mediaArea
      )}
    </div>
  )
}
