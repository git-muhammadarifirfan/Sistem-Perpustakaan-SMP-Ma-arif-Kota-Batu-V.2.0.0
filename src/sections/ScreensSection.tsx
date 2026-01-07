import { useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '../components/Container'
import { Modal } from '../components/Modal'
import { SkeletonImage } from '../components/SkeletonImage'
import { SCREENSHOTS } from '../lib/config'

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

export default function ScreensSection() {
  const shots = useMemo(() => SCREENSHOTS, [])
  const total = shots.length

  // modal
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const openShot = openIndex === null ? null : shots[((openIndex % total) + total) % total]

  // marquee loop
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number>(0)

  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  // speed (px per second)
  const SPEED_PX_PER_SEC = 55

  // arah gerak:
  // 1 = konten bergerak dari kanan -> kiri (scrollLeft nambah)
  // -1 = konten bergerak dari kiri -> kanan (scrollLeft ngurang)
  const DIR: 1 | -1 = 1

  // duplicate items for seamless looping
  const loopItems = useMemo(() => [...shots, ...shots], [shots])

  // pastikan starting point enak (biar looping nggak terasa “ujung”)
  useEffect(() => {
    const node = viewportRef.current
    if (!node) return

    const settle = () => {
      const half = node.scrollWidth / 2
      if (!half) return
      // start di tengah supaya loop mulus (opsional tapi bikin “marquee” lebih kerasa)
      if (node.scrollLeft === 0) node.scrollLeft = half * 0.02
    }

    // tunggu layout siap
    const id = window.setTimeout(settle, 60)
    window.addEventListener('resize', settle)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', settle)
    }
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const tick = (t: number) => {
      const node = viewportRef.current
      if (!node) return

      if (!paused) {
        const dt = lastTRef.current ? t - lastTRef.current : 16
        lastTRef.current = t

        const half = node.scrollWidth / 2
        if (half > 0) {
          const inc = (SPEED_PX_PER_SEC * dt) / 1000
          node.scrollLeft += DIR * inc

          // seamless loop (karena render 2x)
          if (DIR === 1) {
            if (node.scrollLeft >= half) node.scrollLeft -= half
          } else {
            if (node.scrollLeft <= 0) node.scrollLeft += half
          }
        }
      } else {
        lastTRef.current = t
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [paused, reducedMotion])

  // Pause when user scrolls manually (mouse wheel / touch), resume after a short delay
  const resumeTimer = useRef<number | null>(null)
  const pauseTemporarily = () => {
    setPaused(true)
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => setPaused(false), 900)
  }

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current)
    }
  }, [])

  // keyboard navigation in modal
  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex((v) => (v === null ? 0 : (v + 1) % total))
      if (e.key === 'ArrowLeft') setOpenIndex((v) => (v === null ? 0 : (v - 1 + total) % total))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, total])

  const next = () => setOpenIndex((v) => (v === null ? 0 : (v + 1) % total))
  const prev = () => setOpenIndex((v) => (v === null ? 0 : (v - 1 + total) % total))

  return (
    <section id="preview" className="py-16 sm:py-20 scroll-mt-24">
      <Container>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
          Tampilan Aplikasi
        </h2>
        <p className="mt-3 mx-auto max-w-xl px-4 text-center text-sm sm:text-base leading-relaxed text-textSecondary">
          Preview singkat yang menampilkan tampilan aplikasi, fitur utama, dan alur penggunaan
          secara ringkas
        </p>

        <div className="mt-7">
          <div
            ref={viewportRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onWheel={pauseTemporarily}
            onTouchStart={pauseTemporarily}
            onPointerDown={pauseTemporarily}
            className="
              relative w-full overflow-x-auto pb-3
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              rounded-3xl border border-white/10 bg-white/5 shadow-soft
            "
            aria-label="Carousel preview screenshot"
          >
            {/* soft edge fade */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14 bg-gradient-to-r from-black/35 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-14 bg-gradient-to-l from-black/35 to-transparent"
            />

            <div className="flex w-max gap-3 px-3 py-3 sm:gap-4 sm:px-4">
              {loopItems.map((s, i) => {
                const realIndex = i % total
                return (
                  <button
                    key={`${i}-${s.src}`}
                    type="button"
                    onClick={() => setOpenIndex(realIndex)}
                    aria-label={`Preview ${s.alt}`}
                    className="
                      group shrink-0 overflow-hidden rounded-2xl
                      border border-white/10 bg-white/5 shadow-soft
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                      hover:bg-white/8 hover:shadow-lift transition
                      w-56 sm:w-64 md:w-72 lg:w-80
                    "
                  >
                    <SkeletonImage
                      src={s.src}
                      alt={s.alt}
                      className="aspect-[9/16] w-full object-cover"
                    />

                    <div className="pointer-events-none -mt-10 px-3 pb-3">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-black/45 px-3 py-1.5 text-xs text-white/90 backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                        <span className="truncate">{s.alt}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-textSecondary">
            Hover untuk pause • Scroll/drag untuk manual • Klik untuk zoom
          </p>
        </div>
      </Container>

      <Modal
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        title={openShot ? `Preview • ${openShot.alt}` : 'Preview'}
      >
        {openShot ? (
          <div className="relative">
            <img
              src={openShot.src}
              alt={openShot.alt}
              className="w-full max-h-[80vh] rounded-2xl object-contain bg-black/20"
              draggable={false}
            />

            {/* Prev / Next */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-3">
              <button
                type="button"
                onClick={prev}
                className="
                  pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl
                  bg-white/10 text-white ring-1 ring-white/15 backdrop-blur
                  hover:bg-white/16 transition
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                "
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={next}
                className="
                  pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl
                  bg-white/10 text-white ring-1 ring-white/15 backdrop-blur
                  hover:bg-white/16 transition
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                "
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-textSecondary">
              <span>
                {openIndex + 1} / {total}
              </span>
              <span className="opacity-80">← untuk navigasi • Esc untuk tutup</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
