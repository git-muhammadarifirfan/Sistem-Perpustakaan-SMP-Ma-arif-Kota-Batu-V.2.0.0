import { Container } from '../components/Container'
import { Button } from '../components/Button'

type Props = {
  title: string
  subtitle: string
  primaryLabel: string
  onPrimary: () => void
  note?: string
}

export default function CTASection({ title, subtitle, primaryLabel, onPrimary, note }: Props) {
  return (
    <section id="download" className="py-14 sm:py-18 scroll-mt-24">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-[#0B1220] px-6 py-9 sm:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-textPrimary sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-base text-textSecondary">{subtitle}</p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={onPrimary}>{primaryLabel}</Button>
              {note ? <div className="text-sm font-semibold text-textSecondary">{note}</div> : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
