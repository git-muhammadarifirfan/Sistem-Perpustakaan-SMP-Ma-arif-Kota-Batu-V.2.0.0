import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* wrapper */}
      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
        {/* panel */}
        <div
          role="dialog"
          aria-modal="true"
          className="
            relative w-full
            max-w-[min(92vw,1000px)]
            overflow-hidden rounded-3xl
            border border-white/10 bg-background/95 shadow-lift
          "
        >
          {/* header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="min-w-0">
              {title ? (
                <div className="truncate text-base font-extrabold text-textPrimary">
                  {title}
                </div>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-textSecondary hover:bg-white/10 hover:text-textPrimary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* body (scroll aman) */}
          <div className="max-h-[80vh] overflow-auto px-5 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
