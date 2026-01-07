import { createClient, type Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export type RatingRow = {
  id: number
  created_at: string
  user_id: string
  user_name: string
  avatar_url: string | null
  rating: number
  comment: string | null
}

export type RatingSummary = {
  avg_rating: number
  total_reviews: number
  star_5: number
  star_4: number
  star_3: number
  star_2: number
  star_1: number
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session ?? null
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function trackDownload(version?: string): Promise<void> {
  if (!supabase) return
  // Insert event; count total di client pakai count(*)
  await supabase.from('download_events').insert({ version: version ?? null })
}

export async function fetchDownloadCount(): Promise<number> {
  if (!supabase) return 0
  const { count } = await supabase
    .from('download_events')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function fetchRatingSummary(): Promise<RatingSummary> {
  if (!supabase) {
    return { avg_rating: 0, total_reviews: 0, star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0 }
  }

  const { data, error } = await supabase.rpc('get_rating_summary')
  if (!error && Array.isArray(data) && data[0]) {
    const s = data[0] as RatingSummary
    return {
      avg_rating: Number(s.avg_rating ?? 0),
      total_reviews: Number(s.total_reviews ?? 0),
      star_5: Number(s.star_5 ?? 0),
      star_4: Number(s.star_4 ?? 0),
      star_3: Number(s.star_3 ?? 0),
      star_2: Number(s.star_2 ?? 0),
      star_1: Number(s.star_1 ?? 0),
    }
  }

  // fallback (lebih lambat): hitung dari sample terakhir
  const { data: rows } = await supabase
    .from('ratings')
    .select('rating')
    .order('created_at', { ascending: false })
    .limit(200)

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  for (const r of rows ?? []) counts[(r as any).rating] = (counts[(r as any).rating] ?? 0) + 1
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const avg = total ? (1 * counts[1] + 2 * counts[2] + 3 * counts[3] + 4 * counts[4] + 5 * counts[5]) / total : 0
  return {
    avg_rating: avg,
    total_reviews: total,
    star_5: counts[5],
    star_4: counts[4],
    star_3: counts[3],
    star_2: counts[2],
    star_1: counts[1],
  }
}

export async function fetchLatestRatings(limit = 12): Promise<RatingRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('ratings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as RatingRow[]) ?? []
}

export async function upsertMyRating(input: {
  user_id: string
  user_name: string
  avatar_url?: string | null
  rating: number
  comment?: string | null
}): Promise<void> {
  if (!supabase) return
  await supabase.from('ratings').upsert(
    {
      user_id: input.user_id,
      user_name: input.user_name,
      avatar_url: input.avatar_url ?? null,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    { onConflict: 'user_id' },
  )
}
