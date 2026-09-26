import { useState } from 'react'

const FALLBACK_GRADIENTS = {
  video: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #7c2d12 100%)',
  service: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #1e3a5f 100%)',
  blog: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #9a3412 100%)',
  cloud: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)',
}

function getThemeKey(post) {
  if (post.type === 'service') return 'service'
  if (post.thumbnailType === 'cloud') return 'cloud'
  return 'blog'
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

/** Featured image thumbnail for blog/resource cards — no play icon or duration. */
export function ResourceThumbnail({ post, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(post.thumbnailUrl) && !imgFailed

  return (
    <div
      className={`relative aspect-video h-[200px] w-full shrink-0 overflow-hidden rounded-t-2xl ${className}`}
    >
      {showImage ? (
        <img
          src={post.thumbnailUrl}
          alt={post.imageAlt || post.title || ''}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <FallbackPoster post={post} />
      )}
    </div>
  )
}
