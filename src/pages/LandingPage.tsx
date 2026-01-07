import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { LazySection } from '../components/LazySection'
import { CountUp } from '../components/CountUp'
import { Reveal } from '../components/Reveal'
import { IconDownload, IconHistory, IconStar } from '../components/Icon'
import { APP, DOWNLOAD } from '../lib/config'
import { formatCompactNumber } from '../lib/format'
import { fetchDownloadCount, fetchRatingSummary, supabase, trackDownload } from '../lib/supabase'
import { fetchSiteContent, type SiteContent } from '../lib/siteContent'
import { AnimatedLogo } from '../components/AnimatedLogo'

const FeaturesSection = React.lazy(() => import('../sections/FeaturesSection'))
const ScreensSection = React.lazy(() => import('../sections/ScreensSection'))
const RatingsSection = React.lazy(() => import('../sections/RatingsSection'))
const CTASection = React.lazy(() => import('../sections/CTASection'))
const Footer = React.lazy(() => import('../sections/Footer'))

function resolveDownloadUrl(content?: SiteContent | null) {
  const fromEnv = (import.meta.env.VITE_DOWNLOAD_URL as string | undefined) ?? ''
  const fromContent = content?.download_url ?? ''
  const url = (fromContent || fromEnv || DOWNLOAD.fallbackUrl).trim()
  return url
}

function StoreComingSoonBody({ store, onOk }: { store: 'play' | 'appstore'; onOk: () => void }) {
  const title = store === 'play' ? 'Google Play Store' : 'App Store'
  return (
    <div className="relative px-1 pb-1 pt-2">
      <div className="-mt-2 mb-4 flex justify-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="mx-auto max-w-[26rem] text-lg font-extrabold leading-snug text-textPrimary">
          Aplikasi akan segera tersedia di <span className="text-primary">{title}</span>. Untuk
          sementara, silakan download APK langsung.
        </div>
        <div className="mt-3 text-sm font-semibold text-textSecondary">Segera Hadir</div>
      </div>

      <div className="mt-6">
        <button
          onClick={onOk}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-black shadow-soft hover:brightness-95 active:brightness-90"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [downloadCount, setDownloadCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [storeModal, setStoreModal] = useState<null | 'play' | 'appstore'>(null)
  const [downloadModal, setDownloadModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const merged = useMemo(() => ({ ...APP, ...(content?.app ?? {}) }), [content])
  const downloadUrl = useMemo(() => resolveDownloadUrl(content), [content])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const c = await fetchSiteContent('landing')
      if (alive) setContent(c)

      if (!supabase) return
      const [d, s] = await Promise.all([fetchDownloadCount(), fetchRatingSummary()])
      if (!alive) return
      setDownloadCount(d)
      setAvgRating(Number(s.avg_rating ?? 0))
      setReviewsCount(Number(s.total_reviews ?? 0))
    })()
    return () => {
      alive = false
    }
  }, [])

  async function onDownload() {
    try {
      const key = 'dl:last'
      const last = Number(localStorage.getItem(key) ?? '0')
      const now = Date.now()
      if (now - last > 10_000) {
        localStorage.setItem(key, String(now))
        await trackDownload(merged.versionLabel)
        const latest = await fetchDownloadCount()
        setDownloadCount(latest)
      }
    } catch {
      // ignore
    } finally {
      setDownloadModal(true)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = ''
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  const HEADER_OFFSET = 88
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(downloadUrl)
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* Header */}
      <header
        className={
          'sticky top-0 z-50 border-b transition-all duration-300 ' +
          (scrolled
            ? 'border-white/10 bg-background/70 shadow-soft backdrop-blur'
            : 'border-transparent bg-transparent')
        }
      >
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3" aria-label="Home">
              <img src="/brand/logo.png" alt="Logo" className="h-10 w-10 rounded-2xl shadow-soft" />
              <div className="leading-tight">
                <div className="text-base font-bold text-textPrimary">
                  {merged.name} <span className="text-primary">{merged.highlight}</span>
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-textSecondary md:flex">
              <button
                className="hover:text-textPrimary"
                onClick={() => scrollToSection('features')}
              >
                Fitur
              </button>
              <button className="hover:text-textPrimary" onClick={() => scrollToSection('preview')}>
                Tampilan
              </button>
              <button className="hover:text-textPrimary" onClick={() => scrollToSection('rating')}>
                Rating
              </button>
              <Link className="hover:text-textPrimary" to="/reasons">
                Ulasan
              </Link>

              {/* hijau solid (tanpa gradient) */}
              <button
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-extrabold text-black shadow-soft hover:brightness-95 active:brightness-90"
                onClick={onDownload}
              >
                Download
              </button>
            </nav>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <button
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-extrabold text-black shadow-soft hover:brightness-95 active:brightness-90"
                onClick={onDownload}
              >
                Download
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-10 sm:pt-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="matrix-bg" />
          <div className="grid-squares" />

          {/* NEW: skyline kotak putih */}
          <div className="city-squares" />

          <div className="noise-overlay" />
        </div>

        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 mb-10">
            <Reveal>
              <div className="fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-textSecondary">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Aplikasi resmi perpustakaan sekolah
                </div>

                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-textPrimary sm:text-5xl">
                  Perpustakaan digital
                  <br />
                  untuk <span className="text-primary">{merged.highlight}</span>
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-textSecondary">
                  {merged.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button onClick={onDownload} leftIcon={<IconDownload />}>
                    Download {merged.versionLabel}
                  </Button>
                  <Button variant="outline" onClick={() => scrollToSection('preview')}>
                    Lihat Tampilan
                  </Button>
                  <Link to="/reasons">
                    <Button variant="ghost">Baca Ulasan</Button>
                  </Link>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                  {merged.androidOnlyLabel}
                  <span className="mx-1 text-white/20">•</span>
                  {merged.supportsLabel}
                </div>
              </div>
            </Reveal>

            {/* Right: 1 logo besar animasi */}
              <div className="relative">
                <AnimatedLogo src="/brand/logo.png" alt="Logo Perpustakaan" />
              </div>
          </div>
        </Container>
      </section>

      {/* Stats (tetap rapi, lebih clean) */}
      <section className="py-12 sm:py-14">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <Reveal>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-textSecondary">Total Unduhan</div>
                    <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                      <CountUp
                        value={downloadCount}
                        formatter={(v) => formatCompactNumber(Math.round(v))}
                      />
                    </div>
                    <div className="mt-2 text-sm text-textSecondary">
                      Terhitung dari versi rilis terbaru
                    </div>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <IconDownload />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-textSecondary">
                      Penilaian Pengguna
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                      <CountUp value={avgRating} decimals={1} />
                    </div>
                    <div className="mt-2 text-sm text-textSecondary">
                      {reviewsCount
                        ? `Berdasarkan ${formatCompactNumber(reviewsCount)} ulasan`
                        : 'Belum ada ulasan'}
                    </div>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <IconStar />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-textSecondary">Layanan</div>
                    <div className="mt-3 text-3xl font-extrabold text-textPrimary">24/7</div>
                    <div className="mt-2 text-sm text-textSecondary">Siap digunakan kapan saja</div>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <IconHistory />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Sections */}
      <LazySection>
        <FeaturesSection />
      </LazySection>
      <LazySection>
        <ScreensSection />
      </LazySection>
      <LazySection>
        <RatingsSection />
      </LazySection>

      <LazySection>
        <CTASection
          title="Siap Untuk Mencoba?"
          subtitle="Download sekarang dan rasakan pengalaman yang lebih cepat dan nyaman."
          primaryLabel="Download Sekarang"
          onPrimary={onDownload}
          note={merged.supportsLabel}
        />
      </LazySection>

      <LazySection>
        <Footer appName={`${merged.name} ${merged.highlight}`} description={merged.tagline} />
      </LazySection>

      {/* Store modal */}
      <Modal open={storeModal !== null} onClose={() => setStoreModal(null)} title="">
        {storeModal ? (
          <StoreComingSoonBody store={storeModal} onOk={() => setStoreModal(null)} />
        ) : null}
      </Modal>

      {/* Download modal */}
      <Modal open={downloadModal} onClose={() => setDownloadModal(false)} title="Download Dimulai!">
        <div className="space-y-4">
          <p className="text-sm text-textSecondary">
            File sedang diunduh. Jika download tidak berjalan, gunakan link di bawah.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold text-textSecondary">Link Download</div>
            <div className="mt-1 break-all text-sm font-semibold text-textPrimary">
              {downloadUrl}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={copyShareLink}>
              Salin Link
            </Button>
            <Button onClick={() => setDownloadModal(false)}>Tutup</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
