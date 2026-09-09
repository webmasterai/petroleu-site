import fs from 'fs'

const urls = new Set()
const files = [
  'src/content/websiteContent.js',
  'src/content/resources.js',
  'src/content/cityLandingContent.js',
]
const re = /(https?:\/\/[^\s"'`]+|\/images\/[^\s"'`]+|\/videos\/[^\s"'`]+)/g

for (const file of files) {
  const t = fs.readFileSync(file, 'utf8')
  let m
  while ((m = re.exec(t))) {
    urls.add(m[1].replace(/[,)\]}]+$/, ''))
  }
}

const blog = JSON.parse(fs.readFileSync('backend/database/seeders/data/blog_posts.json', 'utf8'))
for (const p of blog) {
  if (p.image_url) urls.add(p.image_url)
  if (p.video_url) urls.add(p.video_url)
}

const assets = [...urls].map((u) => {
  const name = decodeURIComponent((u.split('/').pop() || 'asset').split('?')[0])
  return {
    url: u,
    title: name,
    alt: name,
    market_code: 'pk',
    source: 'imported',
  }
})

fs.writeFileSync('backend/database/seeders/data/media_assets.json', JSON.stringify(assets, null, 2))
console.log('media', assets.length)
