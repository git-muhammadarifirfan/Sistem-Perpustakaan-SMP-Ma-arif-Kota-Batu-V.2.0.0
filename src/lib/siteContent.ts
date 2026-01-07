import { supabase } from './supabase'

export type SiteContent = {
  key: string
  app?: {
    name?: string
    highlight?: string
    tagline?: string
    description?: string
    versionLabel?: string
    androidOnlyLabel?: string
    supportsLabel?: string
  }
  download_url?: string
  hero_image?: string
  updated_at?: string
}

export async function fetchSiteContent(key: string): Promise<SiteContent | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('site_content').select('*').eq('key', key).maybeSingle()
  if (error) return null
  return (data as SiteContent) ?? null
}

export async function upsertSiteContent(input: SiteContent): Promise<void> {
  if (!supabase) return
  await supabase.from('site_content').upsert(input, { onConflict: 'key' })
}

export async function uploadAsset(file: File, pathPrefix = 'uploads'): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`

  const { error } = await supabase.storage.from('assets').upload(path, file, {
    upsert: false,
    cacheControl: '3600',
  })
  if (error) return null

  const { data } = supabase.storage.from('assets').getPublicUrl(path)
  return data.publicUrl ?? null
}
