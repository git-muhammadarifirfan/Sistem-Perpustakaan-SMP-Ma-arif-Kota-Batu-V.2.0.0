import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { StarRating } from '../components/StarRating'
import { Reveal } from '../components/Reveal'
import { timeAgo } from '../lib/format'
import {
  fetchLatestRatings,
  fetchRatingSummary,
  getSession,
  signInWithGoogle,
  signOut,
  upsertMyRating,
  type RatingRow,
  supabase,
} from '../lib/supabase'

function percent(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export default function RatingsSection() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    avg_rating: 0,
    total_reviews: 0,
    star_5: 0,
    star_4: 0,
    star_3: 0,
    star_2: 0,
    star_1: 0,
  })
  const [items, setItems] = useState<RatingRow[]>([])
  const [sessionUser, setSessionUser] = useState<{
    id: string
    name: string
    avatar: string | null
  } | null>(null)
  const [myRating, setMyRating] = useState(5)
  const [myComment, setMyComment] = useState('')

  const scroller = useRef<HTMLDivElement | null>(null)

  const dist = useMemo(
    () => [
      { star: 5, count: summary.star_5 },
      { star: 4, count: summary.star_4 },
      { star: 3, count: summary.star_3 },
      { star: 2, count: summary.star_2 },
      { star: 1, count: summary.star_1 },
    ],
    [summary],
  )

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [s, r, ses] = await Promise.all([
        fetchRatingSummary(),
        fetchLatestRatings(12),
        getSession(),
      ])
      if (!alive) return
      setSummary(s as any)
      setItems(r)
      if (ses?.user) {
        setSessionUser({
          id: ses.user.id,
          name:
            (ses.user.user_metadata?.full_name as string) ?? (ses.user.email as string) ?? 'User',
          avatar: (ses.user.user_metadata?.avatar_url as string) ?? null,
        })
      } else setSessionUser(null)
      setLoading(false)
    })()

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, ses) => {
        if (!ses?.user) setSessionUser(null)
        else
          setSessionUser({
            id: ses.user.id,
            name:
              (ses.user.user_metadata?.full_name as string) ?? (ses.user.email as string) ?? 'User',
            avatar: (ses.user.user_metadata?.avatar_url as string) ?? null,
          })
      })
      return () => {
        alive = false
        sub.subscription.unsubscribe()
      }
    }

    return () => {
      alive = false
    }
  }, [])

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: 'smooth' })
  }

  async function onSubmit() {
    if (!sessionUser) {
      await signInWithGoogle()
      return
    }
    try {
      await upsertMyRating({
        user_id: sessionUser.id,
        user_name: sessionUser.name,
        avatar_url: sessionUser.avatar,
        rating: myRating,
        comment: myComment.trim() ? myComment.trim() : null,
      })
      const [s, r] = await Promise.all([fetchRatingSummary(), fetchLatestRatings(12)])
      setSummary(s as any)
      setItems(r)
      setMyComment('')
    } catch {
      // ignore
    }
  }

  return (
    <section id="rating" className="relative py-16 sm:py-20 scroll-mt-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Reveal>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
                Rating & Ulasan
              </h2>
              <p className="mt-2 text-base text-textSecondary">
                Apa kata pengguna tentang aplikasi ini?
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <Link
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-textPrimary shadow-soft hover:bg-white/8 hover:border-white/20 hover:shadow-lift"
              to="/reasons"
            >
              Lihat semua ulasan <span aria-hidden> </span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-extrabold tracking-tight text-textPrimary">
                    {summary.total_reviews ? summary.avg_rating.toFixed(1) : '—'}
                  </div>
                  <div className="mt-2">
                    <StarRating value={summary.avg_rating} />
                  </div>
                  <div className="mt-2 text-sm text-textSecondary">
                    {summary.total_reviews} reviews
                  </div>
                </div>
                <div className="hidden h-24 w-24 rounded-3xl bg-primary/10 ring-1 ring-white/10 sm:grid sm:place-items-center">
                  <span className="text-3xl text-primary" aria-hidden>
                    ★
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {dist.map((d) => (
                  <div key={d.star} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-semibold text-textPrimary">{d.star}</div>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percent(d.count, summary.total_reviews)}%` }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="w-10 text-right text-sm font-semibold text-textSecondary">
                      {d.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-textPrimary">Ulasan Terbaru</div>
                  <div className="mt-1 text-sm text-textSecondary">
                    Scroll untuk melihat lebih banyak
                  </div>
                </div>

                <div className="hidden gap-2 sm:flex">
                  <button
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg text-textPrimary shadow-soft hover:bg-white/8 hover:border-white/20 hover:shadow-lift"
                    onClick={() => scrollBy(-1)}
                    aria-label="Prev"
                  >
                    ‹
                  </button>
                  <button
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg text-textPrimary shadow-soft hover:bg-white/8 hover:border-white/20 hover:shadow-lift"
                    onClick={() => scrollBy(1)}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div ref={scroller} className="mt-6 flex gap-4 overflow-x-auto pb-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-[260px] rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft"
                    >
                      <Skeleton className="h-4 w-36 rounded-xl" />
                      <Skeleton className="mt-3 h-4 w-24 rounded-xl" />
                      <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
                    </div>
                  ))
                ) : items.length ? (
                  items.map((r) => (
                    <div
                      key={r.id}
                      className="min-w-[260px] rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft"
                    >
                      <div className="flex items-center gap-3">
                        {r.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={r.avatar_url} alt="avatar" />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                            {(r.user_name ?? 'U')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-textPrimary">
                            {r.user_name}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <StarRating value={r.rating} size={16} />
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {r.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 line-clamp-4 text-sm leading-6 text-textSecondary">
                        {r.comment ?? '—'}
                      </div>
                      <div className="mt-3 text-xs text-textSecondary">{timeAgo(r.created_at)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-textSecondary">
                    Belum ada ulasan. Jadilah yang pertama 🙂
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-10">
          <Reveal>
            <section
              id="give-rating"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur sm:p-8"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Left / Header */}
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 ring-1 ring-white/10">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2l2.7 6.2 6.8.6-5.2 4.5 1.6 6.7L12 16.9 6.1 20l1.6-6.7L2.5 8.8l6.8-.6L12 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-textPrimary sm:text-2xl">
                        Berikan Rating
                      </h3>
                      <p className="mt-1 text-sm text-textSecondary">
                        Bantu kami jadi lebih baik — beri rating dan ulasan singkat.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-textSecondary">
                      Maks. 280 karakter
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-textSecondary">
                      Rating 1–5
                    </span>
                  </div>
                </div>

                {/* Right / Content */}
                {!sessionUser ? (
                  <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft ring-1 ring-white/5 lg:mt-1">
                    <div className="text-sm font-semibold text-textPrimary">Login untuk mulai</div>
                    <p className="mt-1 text-sm text-textSecondary">
                      Masuk dengan Google agar kamu bisa mengirim rating & komentar.
                    </p>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => signInWithGoogle()}
                        className="w-full justify-center"
                      >
                        <span className="mr-2 inline-flex">
                          {/* Google SVG */}
                          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path
                              fill="#FFC107"
                              d="M43.611 20.083H42V20H24v8h11.303C33.644 32.657 29.189 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.05 6.053 29.3 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                            />
                            <path
                              fill="#FF3D00"
                              d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.05 6.053 29.3 4 24 4c-7.682 0-14.35 4.337-17.694 10.691z"
                            />
                            <path
                              fill="#4CAF50"
                              d="M24 44c5.087 0 9.744-1.959 13.245-5.148l-6.117-5.174C29.095 35.091 26.662 36 24 36c-5.166 0-9.607-3.315-11.276-7.946l-6.52 5.02C9.506 39.556 16.227 44 24 44z"
                            />
                            <path
                              fill="#1976D2"
                              d="M43.611 20.083H42V20H24v8h11.303c-.802 2.244-2.326 4.146-4.375 5.478l.003-.002 6.117 5.174C36.59 39.02 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
                            />
                          </svg>
                        </span>
                        Login dengan Google
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl">
                    {/* User row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-soft">
                      <div className="flex items-center gap-3">
                        {sessionUser.avatar ? (
                          <img
                            className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
                            src={sessionUser.avatar}
                            alt="avatar"
                          />
                        ) : (
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-semibold text-primary ring-1 ring-white/10">
                            {sessionUser.name?.[0]?.toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-textPrimary">
                            {sessionUser.name}
                          </div>
                          <div className="text-xs text-textSecondary">Terautentikasi • Google</div>
                        </div>
                      </div>

                      <button
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-textPrimary
                           hover:bg-white/10"
                        onClick={() => signOut()}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                          <path
                            d="M10 7V6a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2h-7a2 2 0 01-2-2v-1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M15 12H3m0 0l3-3m-3 3l3 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>

                    {/* Rating */}
                    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-textPrimary">Rating kamu</div>
                          <div className="mt-1 text-xs text-textSecondary">
                            Pilih bintang, lalu tulis komentar singkat.
                          </div>
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-textSecondary">
                          Dipilih: <span className="text-textPrimary">{myRating}</span>/5
                        </span>
                      </div>

                      <div className="mt-4 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <StarRating value={myRating} onChange={(v) => setMyRating(v)} size={22} />
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
                      <label className="text-sm font-semibold text-textPrimary">Komentar</label>
                      <textarea
                        className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-textPrimary shadow-soft
                           outline-none focus:ring-2 focus:ring-primary/35"
                        placeholder="Tulis alasan / ulasan kamu…"
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        maxLength={280}
                        rows={4}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-textSecondary">
                        <span>Gunakan bahasa yang sopan ya.</span>
                        <span>{myComment.length}/280</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button onClick={onSubmit}>Kirim</Button>
                        <Button variant="outline" onClick={() => setMyComment('')} type="button">
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
