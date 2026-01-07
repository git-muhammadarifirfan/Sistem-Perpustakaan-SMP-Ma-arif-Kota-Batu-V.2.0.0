import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { IconBooks, IconGrid, IconHistory, IconSearch, IconUser } from '../components/Icon'

const FEATURES = [
  {
    title: 'Buku Terbaru',
    desc: 'Lihat daftar buku terbaru lengkap dengan cover & ringkasan singkat.',
    icon: <IconBooks />, 
  },
  {
    title: 'Pencarian Cepat',
    desc: 'Cari buku berdasarkan judul, penulis, atau kata kunci dengan cepat.',
    icon: <IconSearch />, 
  },
  {
    title: 'Kategori',
    desc: 'Menelusuri koleksi berdasarkan kategori yang rapi dan mudah dipahami.',
    icon: <IconGrid />, 
  },
  {
    title: 'Koleksi Favorit',
    desc: 'Simpan buku favorit untuk dibaca kapan saja tanpa ribet.',
    icon: <IconBooks />, 
  },
  {
    title: 'Riwayat',
    desc: 'Pantau aktivitas & riwayat bacaan Anda dalam satu tempat.',
    icon: <IconHistory />, 
  },
  {
    title: 'Profil',
    desc: 'Kelola profil pengguna dengan tampilan yang bersih dan nyaman.',
    icon: <IconUser />, 
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20 scroll-mt-24">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">Fitur Unggulan</h2>
            <p className="mt-3 mx-auto max-w-2xl text-base text-textSecondary">
              Dirancang untuk siswa & guru: cepat mencari buku, koleksi rapi, dan ulasan yang transparan.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 0.04}>
              <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:bg-white/8 hover:border-white/20 hover:shadow-lift">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-white/10">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-textPrimary">{f.title}</div>
                    <div className="mt-2 text-sm leading-6 text-textSecondary">{f.desc}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
