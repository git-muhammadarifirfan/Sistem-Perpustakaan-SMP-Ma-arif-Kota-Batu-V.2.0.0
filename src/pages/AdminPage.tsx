import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { getSession, signInWithGoogle, signOut } from '../lib/supabase'
import { fetchSiteContent, upsertSiteContent, uploadAsset, type SiteContent } from '../lib/siteContent'

function parseAllowlist() {
  const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

type FormState = {
  name: string
  highlight: string
  tagline: string
  description: string
  versionLabel: string
  androidOnlyLabel: string
  supportsLabel: string
  download_url: string
  hero_image: string
}

export default function AdminPage() {
  const allow = useMemo(() => parseAllowlist(), [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [content, setContent] = useState<SiteContent | null>(null)
  const [form, setForm] = useState<FormState>({
    name: '',
    highlight: '',
    tagline: '',
    description: '',
    versionLabel: '',
    androidOnlyLabel: '',
    supportsLabel: '',
    download_url: '',
    hero_image: '',
  })

  const emailAllowed = useMemo(() => {
    if (!sessionUser) return false
    if (!allow.length) return true
    return allow.includes((sessionUser.email || '').toLowerCase())
  }, [sessionUser, allow])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const ses = await getSession()
      if (!alive) return
      if (ses?.user) {
        setSessionUser({
          id: ses.user.id,
          email: (ses.user.email as string) ?? '',
          name: (ses.user.user_metadata?.full_name as string) ?? (ses.user.email as string) ?? 'Admin',
        })
      } else setSessionUser(null)

      const c = await fetchSiteContent('landing')
      if (!alive) return
      setContent(c)

      const app = c?.app ?? {}
      setForm({
        name: app.name ?? '',
        highlight: app.highlight ?? '',
        tagline: app.tagline ?? '',
        description: app.description ?? '',
        versionLabel: app.versionLabel ?? '',
        androidOnlyLabel: app.androidOnlyLabel ?? '',
        supportsLabel: app.supportsLabel ?? '',
        download_url: c?.download_url ?? '',
        hero_image: c?.hero_image ?? '',
      })

      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  async function onSave() {
    setSaving(true)
    try {
      const payload: SiteContent = {
        key: 'landing',
        app: {
          name: form.name,
          highlight: form.highlight,
          tagline: form.tagline,
          description: form.description,
          versionLabel: form.versionLabel,
          androidOnlyLabel: form.androidOnlyLabel,
          supportsLabel: form.supportsLabel,
        },
        download_url: form.download_url,
        hero_image: form.hero_image,
      }
      await upsertSiteContent(payload)
      const c = await fetchSiteContent('landing')
      setContent(c)
    } finally {
      setSaving(false)
    }
  }

  async function onUploadHero(file: File) {
    setUploading(true)
    try {
      const url = await uploadAsset(file, 'hero')
      if (url) setForm((p) => ({ ...p, hero_image: url }))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <Link to="/" className="text-sm font-semibold text-primary hover:underline">← Kembali</Link>
              <div className="mt-1 text-xl font-bold text-textPrimary">Admin Panel</div>
              <div className="text-sm text-textSecondary">Edit konten landing (tanpa deploy ulang)</div>
            </div>
            <div className="flex items-center gap-3">
              {sessionUser ? (
                <>
                  <div className="hidden text-sm font-semibold text-textSecondary sm:block">{sessionUser.name}</div>
                  <Button variant="outline" onClick={() => signOut()}>Logout</Button>
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <main className="py-10">
        <Container>
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-soft">
                <Skeleton className="h-5 w-40 rounded-xl" />
                <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-soft">
                <Skeleton className="h-5 w-40 rounded-xl" />
                <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
              </div>
            </div>
          ) : !sessionUser ? (
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-soft">
              <div className="text-lg font-semibold text-textPrimary">Login dulu</div>
              <p className="mt-2 text-sm text-textSecondary">Admin panel butuh login Google (Supabase Auth).</p>
              <div className="mt-6">
                <Button onClick={() => signInWithGoogle()}>Login dengan Google</Button>
              </div>
            </div>
          ) : !emailAllowed ? (
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-soft">
              <div className="text-lg font-semibold text-textPrimary">Akses ditolak</div>
              <p className="mt-2 text-sm text-textSecondary">
                Email kamu tidak ada di allowlist. Tambahkan ke <code className="rounded bg-gray-100 px-1">VITE_ADMIN_EMAILS</code>
                (pisahkan dengan koma).
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
                <div className="text-lg font-semibold text-textPrimary">Konten App</div>
                <div className="mt-4 grid gap-4">
                  <Field label="Nama App" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                  <Field label="Highlight" value={form.highlight} onChange={(v) => setForm((p) => ({ ...p, highlight: v }))} />
                  <Field label="Tagline" value={form.tagline} onChange={(v) => setForm((p) => ({ ...p, tagline: v }))} />
                  <Textarea label="Deskripsi" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Version label" value={form.versionLabel} onChange={(v) => setForm((p) => ({ ...p, versionLabel: v }))} />
                    <Field label="Android only" value={form.androidOnlyLabel} onChange={(v) => setForm((p) => ({ ...p, androidOnlyLabel: v }))} />
                  </div>
                  <Field label="Supports label" value={form.supportsLabel} onChange={(v) => setForm((p) => ({ ...p, supportsLabel: v }))} />
                  <Field label="Download URL" value={form.download_url} onChange={(v) => setForm((p) => ({ ...p, download_url: v }))} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={onSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Perubahan'}</Button>
                  <Link to="/" className="inline-flex">
                    <Button variant="outline">Lihat Landing</Button>
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
                <div className="text-lg font-semibold text-textPrimary">Hero Image</div>
                <p className="mt-2 text-sm text-textSecondary">Upload gambar preview untuk HP di landing page.</p>

                <div className="mt-4 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
                  {form.hero_image ? (
                    <img src={form.hero_image} alt="Hero" className="h-[340px] w-full object-cover" />
                  ) : (
                    <div className="grid h-[340px] place-items-center text-sm text-textSecondary">Belum ada gambar</div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-textPrimary">Upload file</label>
                  <input
                    className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-textPrimary shadow-soft"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void onUploadHero(f)
                    }}
                    disabled={uploading}
                  />
                  <div className="mt-3 text-xs text-textSecondary">
                    {uploading ? 'Mengunggah…' : 'Format: JPG/PNG. Disarankan portrait.'}
                  </div>
                </div>

                <div className="mt-6">
                  <Field label="Hero image URL" value={form.hero_image} onChange={(v) => setForm((p) => ({ ...p, hero_image: v }))} />
                </div>
              </section>
            </div>
          )}
        </Container>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-textPrimary">{label}</div>
      <input
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-textPrimary shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-textPrimary">{label}</div>
      <textarea
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm text-textPrimary shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
    </label>
  )
}
