// ─── PMS Lite Service Worker ───────────────────────────────────────────────
// Strategy:
//  • Navigation (HTML)  → Network first, cache fallback (SPA always returns index.html)
//  • Static assets      → Cache first, background network update (stale-while-revalidate)
//  • API /api/*         → Never intercept (handled by app layer / IndexedDB queue)
//  • External (fonts)   → Cache first

const CACHE_NAME = 'pms-lite-v5'

/** Mirror server prefersMarkdown — Markdown only when explicitly preferred over HTML. */
function prefersMarkdownAccept(acceptHeader) {
  if (!acceptHeader || !String(acceptHeader).trim()) return false
  const parts = acceptHeader.split(',').map((part) => {
    const [type, ...params] = part.trim().split(';')
    const qParam = params.find((x) => x.trim().startsWith('q='))
    const q = qParam ? parseFloat(qParam.split('=')[1]) : 1
    return { type: type.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 }
  })
  const htmlQ = parts.find((p) => p.type === 'text/html')?.q ?? 0
  const mdQ = parts.find((p) => p.type === 'text/markdown')?.q ?? 0
  if (mdQ <= 0) return false
  if (htmlQ <= 0) return true
  return mdQ > htmlQ
}

// ── Install: cache the app shell entry point ───────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache both variants of the shell
      const urls = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png']
      await Promise.allSettled(urls.map(url => cache.add(url).catch(() => null)))
    })
  )
  // Take control immediately — don't wait for old tabs to close
  self.skipWaiting()
})

// ── Activate: delete old caches and claim all tabs ────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Message: client asks SW to warm-up the cache ─────────────────────────
// Called from main.jsx after page fully loads — caches all JS/CSS/font URLs
self.addEventListener('message', (event) => {
  if (event.data?.type === 'WARM_CACHE') {
    const urls = (event.data.urls || []).filter(u => {
      try {
        const parsed = new URL(u)
        return parsed.origin === location.origin && !parsed.pathname.startsWith('/api')
      } catch { return false }
    })
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache =>
        Promise.allSettled(
          urls.map(url =>
            cache.match(url).then(hit => {
              if (hit) return // already cached
              return fetch(url, { cache: 'no-cache' })
                .then(res => { if (res.ok) cache.put(url, res) })
                .catch(() => null)
            })
          )
        )
      )
    )
  }
})

// ── Fetch: intercept all requests ────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // 1. Only handle GET
  if (request.method !== 'GET') return

  // 2. Skip API calls — managed by app (axios + IndexedDB)
  if (url.pathname.startsWith('/api')) return

  // 3. Navigation requests → Network first, SPA fallback (HTML only — never cache Markdown as HTML)
  if (request.mode === 'navigate') {
    const accept = request.headers.get('Accept') || ''
    const wantsMarkdown = prefersMarkdownAccept(accept)

    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok && !wantsMarkdown) {
            const contentType = res.headers.get('Content-Type') || ''
            if (contentType.includes('text/html')) {
              const clone = res.clone()
              caches.open(CACHE_NAME).then(cache => {
                // Cache by full request (URL + Accept) so HTML/Markdown cannot collide.
                cache.put(request, clone)
              })
            }
          }
          return res
        })
        .catch(async () => {
          if (wantsMarkdown) {
            return new Response('Offline', { status: 503, statusText: 'Offline' })
          }
          // Offline → serve cached HTML for this navigation request only
          const cached = await caches.match(request)
          if (cached) return cached
          // If never cached before, inform the user
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="UTF-8">
             <meta name="viewport" content="width=device-width,initial-scale=1">
             <title>PMS Lite — Offline</title>
             <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc}
             .box{text-align:center;padding:2rem;border-radius:1rem;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.08)}
             h2{color:#ea580c}p{color:#64748b}</style></head>
             <body><div class="box">
               <h2>⚠️ App Not Cached Yet</h2>
               <p>Please open PMS Lite <strong>once while online</strong> to enable offline mode.</p>
               <button onclick="location.reload()" style="margin-top:1rem;padding:.6rem 1.5rem;background:#ea580c;color:#fff;border:none;border-radius:.5rem;cursor:pointer;font-size:1rem">Retry</button>
             </div></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          )
        })
    )
    return
  }

  // 4. Static assets (JS, CSS, fonts, images) → Stale-while-revalidate
  e.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(request)

      // Kick off network fetch to refresh cache in background
      const networkFetch = fetch(request)
        .then(res => {
          if (res.ok) cache.put(request, res.clone())
          return res
        })
        .catch(() => null)

      // Return cache immediately if we have it (fast), else wait for network
      if (cached) {
        // Background refresh — don't await
        networkFetch.catch(() => {})
        return cached
      }

      const fresh = await networkFetch
      return fresh || new Response('', { status: 503, statusText: 'Offline' })
    })
  )
})
