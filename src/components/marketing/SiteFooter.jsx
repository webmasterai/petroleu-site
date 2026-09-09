import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cmsGet } from '../../services/cmsApi'
import { websiteContent } from '../../content/websiteContent'
import { PMS_APP_URL, pmsAppHref } from '../../config/pmsApp'

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
  </svg>
)

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04a3.43 3.43 0 0 0-.83-1.27 3.43 3.43 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38-1.24-.06-1.59-.07-4.74-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08zm5.69-9.21a1.28 1.28 0 1 1-2.56 0 1.28 1.28 0 0 1 2.56 0z" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17.34V10.4H6.06v6.94h2.28zM7.2 9.36a1.32 1.32 0 1 0 0-2.64 1.32 1.32 0 0 0 0 2.64zm10.14 7.98v-3.8c0-2.04-1.09-2.99-2.55-2.99-1.18 0-1.7.65-1.99 1.1V10.4h-2.28c.03.64 0 6.94 0 6.94h2.28v-3.88c0-.21.01-.41.07-.56.17-.41.55-.84 1.19-.84.84 0 1.18.64 1.18 1.58v3.7h2.1z" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.5 6.51a2.78 2.78 0 0 0-1.95-2C19.79 4 12 4 12 4s-7.79 0-9.55.51a2.78 2.78 0 0 0-1.95 2A29.94 29.94 0 0 0 0 12a29.94 29.94 0 0 0 .5 5.49 2.78 2.78 0 0 0 1.95 2C4.21 20 12 20 12 20s7.79 0 9.55-.51a2.78 2.78 0 0 0 1.95-2A29.94 29.94 0 0 0 24 12a29.94 29.94 0 0 0-.5-5.49zM9.6 15.57V8.43L15.82 12 9.6 15.57z" />
  </svg>
)

export function SiteFooter() {
  const [s, setS] = useState({})

  useEffect(() => {
    cmsGet('/settings')
      .then((data) => setS(data && typeof data === 'object' ? data : {}))
      .catch(() => setS({}))
  }, [])

  const brand = websiteContent.brand
  const fb = websiteContent.footer

  const siteName = s.site_name || brand.name
  const description = s.site_tagline || fb.description
  const phone = fb.phone
  const phoneTel = brand.phoneTel || fb.phoneTel
  const email = fb.email
  const address = s.address_pk || s.address || fb.address

  const productLinks = [
    { label: 'Features', to: '/features' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Mobile App', to: '/#mobile' },
  ]

  const resourceLinks = [
    { label: 'Developer Resources', to: '/developers' },
    { label: 'Documentation', to: '/docs' },
    { label: 'API Docs', to: '/docs/api' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Reports', to: '/product/reports' },
    { label: 'FAQs', to: '/faq' },
  ]

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    ...(PMS_APP_URL
      ? [{ label: 'Login', external: true, href: pmsAppHref('/login') }]
      : [{ label: 'Login', to: '/contact' }]),
    { label: 'Get Started', to: '/get-started' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/contact' },
    { label: 'Refund Policy', to: '/contact' },
  ]

  const socials = [
    { url: s.facebook_url || `https://facebook.com/${brand.domain}`, label: 'Facebook', icon: <FacebookIcon className="h-4 w-4" /> },
    { url: s.instagram_url || `https://instagram.com/${brand.domain}`, label: 'Instagram', icon: <InstagramIcon className="h-4 w-4" /> },
    { url: s.linkedin_url || `https://linkedin.com/company/${brand.name.toLowerCase()}`, label: 'LinkedIn', icon: <LinkedinIcon className="h-4 w-4" /> },
    { url: s.youtube_url || `https://youtube.com/@${brand.name.toLowerCase()}`, label: 'YouTube', icon: <YoutubeIcon className="h-4 w-4" /> },
  ]

  const renderLink = (l, key) => {
    if (l.external) {
      return (
        <a
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {l.label}
        </a>
      )
    }
    if (l.to && l.to.includes('#')) {
      return (
        <a
          href={l.to}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {l.label}
        </a>
      )
    }
    return (
      <Link
        to={l.to}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {l.label}
      </Link>
    )
  }

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center" aria-label={siteName}>
              <img
                src="/petroleu-logo.png"
                alt={siteName}
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${phoneTel}`} className="hover:text-foreground transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>{address}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((l) => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((l) => (
                <li key={l.label}>{renderLink(l)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">Made with care in Pakistan</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
