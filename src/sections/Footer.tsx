import { Container } from '../components/Container'

type Props = {
  appName: string
  description: string
}

export default function Footer({ appName, description }: Props) {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-background">
      <Container>
        <div className="grid gap-10 py-12 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src="/brand/logo.png" alt="Logo" className="h-10 w-10 rounded-2xl shadow-soft" />
              <div className="text-lg font-semibold text-textPrimary">{appName}</div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-textSecondary">{description}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-textPrimary">Tentang Project</div>
              <ul className="mt-3 space-y-2 text-sm text-textSecondary">
                <li>Stack: React + Supabase</li>
                <li>UI: Tailwind + animasi ringan</li>
                <li>Tahun: {year}</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-textPrimary">Link</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className="font-semibold text-primary hover:underline" href="#features">
                    Fitur
                  </a>
                </li>
                <li>
                  <a className="font-semibold text-primary hover:underline" href="#preview">
                    Preview
                  </a>
                </li>
                <li>
                  <a className="font-semibold text-primary hover:underline" href="#rating">
                    Rating
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-textSecondary">
          © {year} {appName}. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
