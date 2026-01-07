import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { ScrollToTop } from '../components/ScrollToTop'
import { Skeleton } from '../components/Skeleton'
import { StarRating } from '../components/StarRating'
import { CountUp } from '../components/CountUp'
import { formatCompactNumber, timeAgo } from '../lib/format'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '../components/Dropdown'
import {
  fetchDownloadCount,
  fetchRatingSummary,
  getSession,
  signInWithGoogle,
  signOut,
  upsertMyRating,
  type RatingRow,
  supabase,
} from '../lib/supabase'

const PAGE_SIZE = 12

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Terbaru' },
  { key: 'oldest', label: 'Terlama' },
  { key: 'highest', label: 'Rating Tertinggi' },
  { key: 'lowest', label: 'Rating Terendah' },
]

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function percent(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function buildPageList(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = []
  const push = (v: number | '…') => {
    if (pages[pages.length - 1] !== v) pages.push(v)
  }

  push(1)
  if (current > 3) push('…')

  for (let p = current - 1; p <= current + 1; p++) {
    if (p > 1 && p < total) push(p)
  }

  if (current < total - 2) push('…')
  push(total)

  return pages
}

function GoogleIcon() {
  return (
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
  )
}

export default function ReasonsPage() {
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)

  const [downloadCount, setDownloadCount] = useState(0)
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
  const [totalRows, setTotalRows] = useState(0)

  const [sessionUser, setSessionUser] = useState<{
    id: string
    name: string
    avatar: string | null
  } | null>(null)

  // filter/sort/pagination
  const [sort, setSort] = useState<SortKey>('newest')
  const [minStars, setMinStars] = useState<number>(0) // 0 = semua
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const listTopRef = useRef<HTMLDivElement | null>(null)

  // editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

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

  const satisfaction = useMemo(
    () => percent(summary.star_5 + summary.star_4, summary.total_reviews),
    [summary],
  )

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)), [totalRows])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [d, s, ses] = await Promise.all([fetchDownloadCount(), fetchRatingSummary(), getSession()])
      if (!alive) return

      setDownloadCount(d)
      setSummary(s as any)

      if (ses?.user) {
        setSessionUser({
          id: ses.user.id,
          name:
            (ses.user.user_metadata?.full_name as string) ??
            (ses.user.email as string) ??
            'User',
          avatar: (ses.user.user_metadata?.avatar_url as string) ?? null,
        })
      } else setSessionUser(null)

      await fetchList({ resetPage: true })
      if (alive) setLoading(false)
    })()

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, ses) => {
        if (!ses?.user) setSessionUser(null)
        else
          setSessionUser({
            id: ses.user.id,
            name:
              (ses.user.user_metadata?.full_name as string) ??
              (ses.user.email as string) ??
              'User',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchList()
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, minStars, page, q])

  async function fetchList(opts?: { resetPage?: boolean }) {
    if (!supabase) return

    if (opts?.resetPage) setPage(1)

    setListLoading(true)
    const currentPage = opts?.resetPage ? 1 : page
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('ratings').select('*', { count: 'exact' })

    if (minStars > 0) query = query.gte('rating', minStars)

    const keyword = q.trim()
    if (keyword) {
      const safe = keyword.replaceAll(',', ' ')
      query = query.or(`comment.ilike.%${safe}%,user_name.ilike.%${safe}%`)
    }

    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    if (sort === 'oldest') query = query.order('created_at', { ascending: true })
    if (sort === 'highest')
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false })
    if (sort === 'lowest')
      query = query.order('rating', { ascending: true }).order('created_at', { ascending: false })

    const { data, error, count } = await query.range(from, to)

    if (!error) {
      setItems(((data as RatingRow[]) ?? []) as RatingRow[])
      setTotalRows(count ?? 0)

      requestAnimationFrame(() => {
        listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    setListLoading(false)
  }

  function startEdit(r: RatingRow) {
    setEditingId(r.id)
    setEditRating(Math.round(r.rating))
    setEditComment(r.comment ?? '')
  }

  async function saveEdit(_r: RatingRow) {
    if (!sessionUser) return
    try {
      await upsertMyRating({
        user_id: sessionUser.id,
        user_name: sessionUser.name,
        avatar_url: sessionUser.avatar,
        rating: editRating,
        comment: editComment.trim() ? editComment.trim() : null,
      })
      const s = await fetchRatingSummary()
      setSummary(s as any)
      setEditingId(null)
      await fetchList()
    } catch {
      // ignore
    }
  }

  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 shadow-soft backdrop-blur">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/brand/logo.png" alt="Logo" className="h-10 w-10 rounded-2xl shadow-soft" />
              <div className="text-base font-bold text-textPrimary">Semua Ulasan</div>
            </Link>

            <div className="flex items-center gap-3">
              {sessionUser ? (
                <button
                  className="text-sm font-semibold text-primary hover:underline"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              ) : null}
              <Link
                to="/"
                className="hidden text-sm font-semibold text-textSecondary hover:text-textPrimary sm:inline"
              >
                Home
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="blob animate-blob1 left-[-140px] top-[-120px] h-[300px] w-[300px] bg-primary/30" />
          <div className="blob animate-blob2 right-[-160px] top-[40px] h-[340px] w-[340px] bg-info/30" />
        </div>

        <Container>
          <div className="text-sm font-semibold text-textSecondary">
            <Link className="hover:underline" to="/">
              Home
            </Link>{' '}
            <span className="mx-2">/</span>
            <span className="text-textPrimary">Ulasan Pengguna</span>
          </div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-textPrimary sm:text-5xl">
            Ulasan Pengguna
          </h1>
          <p className="mt-3 max-w-2xl text-base text-textSecondary">
            Apa kata pengguna tentang aplikasi ini?
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="text-sm font-semibold text-textSecondary">Total Download</div>
              <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                <CountUp value={downloadCount} formatter={(v) => formatCompactNumber(Math.round(v))} />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="text-sm font-semibold text-textSecondary">Rating Rata-rata</div>
              <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                <CountUp value={summary.avg_rating} decimals={1} />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="text-sm font-semibold text-textSecondary">Total Ulasan</div>
              <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                <CountUp value={summary.total_reviews} />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="text-sm font-semibold text-textSecondary">Kepuasan</div>
              <div className="mt-3 text-3xl font-extrabold text-textPrimary">
                <CountUp value={satisfaction} />%
              </div>
            </div>
          </div>
        </Container>
      </section>

      <main className="pb-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-[92px] space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="text-sm font-semibold text-textSecondary">Distribusi Rating</div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-extrabold text-textPrimary">
                        {summary.total_reviews ? summary.avg_rating.toFixed(1) : '—'}
                      </div>
                      <div className="mt-2">
                        <StarRating value={summary.avg_rating} />
                      </div>
                      <div className="mt-2 text-sm text-textSecondary">{summary.total_reviews} ulasan</div>
                    </div>

                    <div className="hidden h-20 w-20 rounded-3xl bg-primary/10 sm:grid sm:place-items-center">
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
                        <div className="w-10 text-right text-sm font-semibold text-textSecondary">{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="text-sm font-semibold text-textSecondary">Login untuk memberikan rating</div>

                  {!sessionUser ? (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => signInWithGoogle()}
                        className="w-full justify-center"
                      >
                        <span className="mr-2 inline-flex">
                          <GoogleIcon />
                        </span>
                        Login dengan Google
                      </Button>

                      <div className="mt-3 text-xs text-textSecondary">
                        Setelah login, kamu bisa update ulasanmu.
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-textPrimary">Halo, {sessionUser.name}</div>
                      <button
                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link to="/">
                      <Button className="w-full">Download Aplikasi</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* List */}
            <section className="lg:col-span-8">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <div ref={listTopRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-textPrimary">Semua Ulasan</div>
                    <div className="mt-1 text-sm text-textSecondary">
                      Menampilkan <span className="text-textPrimary">{items.length}</span> dari{' '}
                      <span className="text-textPrimary">{totalRows}</span> ulasan
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
                    {/* SORT (Dropdown custom) */}
                    <div className="sm:col-span-1">
                      <div className="text-xs font-semibold text-textSecondary">Urutkan</div>

                      <div className="mt-2">
                        <Dropdown
                          align="left"
                          width="md"
                          className="w-full" // ✅ penting biar tombol lebar penuh
                          button={({ open, toggle, buttonProps }) => {
                            const label = SORTS.find((s) => s.key === sort)?.label ?? 'Urutkan'
                            return (
                              <button
                                {...buttonProps}
                                onClick={toggle}
                                className="
                                  w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2
                                  text-left text-sm font-semibold text-textPrimary shadow-soft outline-none
                                  focus:ring-2 focus:ring-primary/30
                                  flex items-center justify-between gap-2
                                  hover:bg-white/7 transition
                                "
                              >
                                <span className="truncate">{label}</span>
                                <ChevronDown className={`h-4 w-4 opacity-80 transition ${open ? 'rotate-180' : ''}`} />
                              </button>
                            )
                          }}
                        >
                          {({ close }) => (
                            <>
                              <DropdownLabel>Urutkan</DropdownLabel>
                              <DropdownSeparator />

                              {SORTS.map((s) => (
                                <DropdownItem
                                  key={s.key}
                                  active={s.key === sort}
                                  onClick={() => {
                                    setPage(1)
                                    setSort(s.key)
                                    close()
                                  }}
                                >
                                  {s.label}
                                </DropdownItem>
                              ))}
                            </>
                          )}
                        </Dropdown>
                      </div>
                    </div>

                    {/* MIN STARS (select native, boleh nanti kamu ubah jadi dropdown juga) */}
                    <div className="sm:col-span-1">
                      <div className="text-xs font-semibold text-textSecondary">Min Bintang</div>
                      <select
                        value={minStars}
                        onChange={(e) => {
                          setPage(1)
                          setMinStars(parseInt(e.target.value, 10))
                        }}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-textPrimary shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value={0}>Semua</option>
                        <option value={5}>5+</option>
                        <option value={4}>4+</option>
                        <option value={3}>3+</option>
                        <option value={2}>2+</option>
                        <option value={1}>1+</option>
                      </select>
                    </div>

                    {/* SEARCH */}
                    <div className="sm:col-span-1">
                      <div className="text-xs font-semibold text-textSecondary">Cari</div>
                      <input
                        value={q}
                        onChange={(e) => {
                          setPage(1)
                          setQ(e.target.value)
                        }}
                        placeholder="nama / komentar…"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-textPrimary shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {loading || listLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
                        <Skeleton className="h-4 w-48 rounded-xl" />
                        <Skeleton className="mt-3 h-4 w-28 rounded-xl" />
                        <Skeleton className="mt-5 h-14 w-full rounded-2xl" />
                      </div>
                    ))
                  ) : items.length ? (
                    items.map((r) => {
                      const isMine = !!sessionUser && r.user_id === sessionUser.id
                      const isEditing = editingId === r.id

                      return (
                        <div key={r.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {r.avatar_url ? (
                                <img
                                  className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
                                  src={r.avatar_url}
                                  alt="avatar"
                                />
                              ) : (
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-semibold text-primary ring-1 ring-white/10">
                                  {(r.user_name ?? 'U')[0]?.toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="truncate text-sm font-semibold text-textPrimary">{r.user_name}</div>
                                  <span className="text-xs text-textSecondary">• {timeAgo(r.created_at)}</span>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <StarRating value={r.rating} size={18} />
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                    {r.rating.toFixed(1)}
                                  </span>
                                  {isMine ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-textSecondary">
                                      Ulasan kamu
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {isMine ? (
                              <div className="flex items-center gap-2">
                                {!isEditing ? (
                                  <button
                                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-textPrimary shadow-soft hover:bg-white/10"
                                    onClick={() => startEdit(r)}
                                    type="button"
                                  >
                                    Edit
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          {!isEditing ? (
                            <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-textSecondary">
                              {r.comment ?? '—'}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="text-sm font-semibold text-textPrimary">Update Rating</div>
                                <StarRating value={editRating} onChange={(v) => setEditRating(v)} size={22} />
                                <span className="text-xs font-semibold text-textSecondary">Dipilih: {editRating}/5</span>
                              </div>

                              <textarea
                                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-textPrimary shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows={4}
                                maxLength={280}
                                placeholder="Tulis komentar…"
                              />

                              <div className="mt-3 flex flex-wrap gap-3">
                                <Button onClick={() => saveEdit(r)}>Update</Button>
                                <Button variant="outline" onClick={() => setEditingId(null)} type="button">
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                      <div className="text-sm font-semibold text-textPrimary">Tidak ada hasil</div>
                      <div className="mt-2 text-sm text-textSecondary">Coba ubah filter atau kata kunci.</div>
                      <div className="mt-6 flex justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQ('')
                            setMinStars(0)
                            setSort('newest')
                            setPage(1)
                          }}
                        >
                          Reset filter
                        </Button>
                        <Link to="/#give-rating">
                          <Button>Berikan Rating</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
                  <div className="text-sm text-textSecondary">
                    Halaman <span className="font-semibold text-textPrimary">{page}</span> dari{' '}
                    <span className="font-semibold text-textPrimary">{totalPages}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
                      disabled={page <= 1 || listLoading}
                    >
                      Prev
                    </Button>

                    {pages.map((p, idx) =>
                      p === '…' ? (
                        <span key={`dots-${idx}`} className="px-2 text-sm text-textSecondary">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={[
                            'h-10 min-w-[40px] rounded-2xl border px-3 text-sm font-semibold shadow-soft',
                            p === page
                              ? 'border-primary/40 bg-primary/15 text-primary'
                              : 'border-white/10 bg-white/5 text-textPrimary hover:bg-white/10',
                          ].join(' ')}
                          disabled={listLoading}
                          type="button"
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
                      disabled={page >= totalPages || listLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>

      <ScrollToTop />
    </div>
  )
}
