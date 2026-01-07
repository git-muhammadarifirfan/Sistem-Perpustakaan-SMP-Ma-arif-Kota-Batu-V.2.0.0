import { Container } from '../components/Container'

type Props = {
  repoUrl?: string
}

const TEAM = [
  { kelas: 'RI-7A', nim: '202210370311324', nama: 'Raka Adyatma Bimasakti', github: 'rakarajinibadah' },
  { kelas: 'RI-7A', nim: '202210370311351', nama: 'Farid Anugraha', github: 'Srellica' },
  { kelas: 'RI-7D', nim: '202210370311011', nama: 'Mohamad Raihan', github: 'Reeyyyh' },
  { kelas: 'RI-7D', nim: '202210370311030', nama: 'Muhammad Arif Irfan', github: 'marifirfannn' },
]

export default function Footer({ repoUrl = 'https://github.com/Reeyyyh/library_app' }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-background">
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-3 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo.png"
                alt="Logo"
                className="h-10 w-10 rounded-2xl shadow-soft ring-1 ring-white/10"
              />
              <div>
                <div className="text-base font-extrabold tracking-tight text-textPrimary">
                  Perpustakaan Digital
                </div>
                <div className="text-sm font-semibold text-primary">SMP Ma&apos;arif Kota Batu</div>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-textSecondary">
              Aplikasi resmi Perpustakaan SMP Ma&apos;arif Kota Batu untuk mencari buku, melihat koleksi terbaru, dan
              menyimpan favorit lebih cepat, rapi, dan nyaman.
            </p>
          </div>

          {/* About */}
          <div>
            <div className="text-sm font-extrabold text-textPrimary">Tentang Project</div>

            <ul className="mt-4 space-y-2 text-sm text-textSecondary">
              <li>
                <span className="font-semibold text-textPrimary/90">Mata Kuliah:</span> Rekayasa Interaksi
              </li>
              <li>
                <span className="font-semibold text-textPrimary/90">Universitas:</span> Universitas Muhammadiyah Malang
              </li>
              <li>
                <span className="font-semibold text-textPrimary/90">Tahun:</span> 2025/2026
              </li>
            </ul>

            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary hover:underline"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 .6a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.3-3.9-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .6Z" />
              </svg>
              GitHub Repository
            </a>
          </div>

          {/* Team */}
          <div>
            <div className="text-sm font-extrabold text-textPrimary">Tim Pengembang</div>

            <ul className="mt-4 space-y-2 text-sm text-textSecondary">
              {TEAM.map((p) => (
                <li key={p.nim} className="leading-6">
                  <span className="font-semibold text-textPrimary/90">{p.nama}</span>{' '}
                  <span className="text-textSecondary/80">
                    ({p.kelas} • {p.nim})
                  </span>
                  <div className="text-xs text-textSecondary/80">
                    GitHub:{' '}
                    <span className="font-semibold text-textPrimary/80">{p.github}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-textSecondary">
          © {year} Perpustakaan SMP Ma&apos;arif Kota Batu. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
